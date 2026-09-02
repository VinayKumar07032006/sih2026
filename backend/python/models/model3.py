from ultralytics import YOLO
import cv2
import os
import json

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "yolo11n.pt")
VIDEO_PATH = os.path.join(BASE_DIR, "trafficTest.mp4")
OUTPUT_PATH = os.path.join(BASE_DIR, "traffic_signal_result.mp4")
DETAILS_PATH = os.path.join(BASE_DIR, "vehicle_details.json")


# ============================================================
# LOAD MODEL
# ============================================================

model = YOLO(MODEL_PATH)


# ============================================================
# CHECK VIDEO
# ============================================================

if not os.path.exists(VIDEO_PATH):
    print("ERROR: Video not found:")
    print(VIDEO_PATH)
    exit()


# ============================================================
# VIDEO SETUP
# ============================================================

video = cv2.VideoCapture(VIDEO_PATH)

fps = video.get(cv2.CAP_PROP_FPS)
width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

if fps == 0 or width == 0 or height == 0:
    print("ERROR: Could not read video.")
    exit()

fps = int(fps)

out = cv2.VideoWriter(
    OUTPUT_PATH,
    cv2.VideoWriter_fourcc(*"mp4v"),
    fps,
    (width, height)
)


# ============================================================
# COCO CLASSES
# ============================================================

VEHICLES = {
    2: "CAR",
    3: "MOTORCYCLE",
    5: "BUS",
    7: "TRUCK"
}

TRAFFIC_LIGHT = 9


# ============================================================
# VEHICLE DETAILS
# ============================================================

vehicle_details = {}


# ============================================================
# TRAFFIC LIGHT COLOR
# ============================================================

def get_signal_color(crop):

    if crop is None or crop.size == 0:
        return "UNKNOWN"

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)

    # RED
    red1 = cv2.inRange(
        hsv,
        (0, 80, 80),
        (10, 255, 255)
    )

    red2 = cv2.inRange(
        hsv,
        (170, 80, 80),
        (180, 255, 255)
    )

    red_pixels = cv2.countNonZero(red1) + cv2.countNonZero(red2)

    # YELLOW
    yellow = cv2.inRange(
        hsv,
        (15, 80, 80),
        (35, 255, 255)
    )

    yellow_pixels = cv2.countNonZero(yellow)

    # GREEN
    green = cv2.inRange(
        hsv,
        (35, 60, 60),
        (90, 255, 255)
    )

    green_pixels = cv2.countNonZero(green)

    values = {
        "RED": red_pixels,
        "YELLOW": yellow_pixels,
        "GREEN": green_pixels
    }

    best_color = max(values, key=values.get)

    # Avoid random color detections
    if values[best_color] < 5:
        return "UNKNOWN"

    return best_color


# ============================================================
# PROCESS VIDEO
# ============================================================

for result in model.track(
    source=VIDEO_PATH,
    stream=True,
    persist=True,
    tracker="bytetrack.yaml",
    classes=[2, 3, 5, 7, 9],
    conf=0.35
):

    frame = result.orig_img.copy()

    signal_states = []


    # ========================================================
    # DETECTIONS
    # ========================================================

    if result.boxes is not None:

        boxes = result.boxes.xyxy.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        if result.boxes.id is not None:
            ids = result.boxes.id.cpu().numpy()
        else:
            ids = [None] * len(boxes)


        for box, cls, confidence, track_id in zip(
            boxes,
            classes,
            confidences,
            ids
        ):

            x1, y1, x2, y2 = map(int, box)

            class_id = int(cls)


            # =================================================
            # TRAFFIC LIGHT
            # =================================================

            if class_id == TRAFFIC_LIGHT:

                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(width, x2)
                y2 = min(height, y2)

                crop = frame[y1:y2, x1:x2]

                signal_color = get_signal_color(crop)

                signal_states.append(signal_color)

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (255, 255, 0),
                    3
                )

                cv2.putText(
                    frame,
                    f"SIGNAL: {signal_color}",
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 0),
                    2
                )

                continue


            # =================================================
            # VEHICLE
            # =================================================

            if class_id in VEHICLES:

                vehicle_type = VEHICLES[class_id]

                if track_id is not None:
                    vehicle_id = int(track_id)
                else:
                    vehicle_id = -1


                # Save vehicle information
                if vehicle_id != -1:

                    vehicle_details[str(vehicle_id)] = {
                        "vehicle_id": vehicle_id,
                        "vehicle_type": vehicle_type,
                        "confidence": round(float(confidence), 3)
                    }


                # Draw vehicle
                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )


                label = (
                    f"ID:{vehicle_id} "
                    f"{vehicle_type} "
                    f"{float(confidence):.2f}"
                )

                cv2.putText(
                    frame,
                    label,
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    (0, 255, 0),
                    2
                )


    # ========================================================
    # DETERMINE OVERALL SIGNAL
    # ========================================================

    if "RED" in signal_states:
        overall_signal = "RED"

    elif "GREEN" in signal_states:
        overall_signal = "GREEN"

    elif "YELLOW" in signal_states:
        overall_signal = "YELLOW"

    else:
        overall_signal = "UNKNOWN"


    # ========================================================
    # SIGNAL DISPLAY COLOR
    # ========================================================

    if overall_signal == "RED":
        display_color = (0, 0, 255)

    elif overall_signal == "GREEN":
        display_color = (0, 255, 0)

    elif overall_signal == "YELLOW":
        display_color = (0, 255, 255)

    else:
        display_color = (255, 255, 255)


    # ========================================================
    # DISPLAY SIGNAL STATUS
    # ========================================================

    cv2.rectangle(
        frame,
        (10, 10),
        (330, 65),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        frame,
        f"TRAFFIC SIGNAL: {overall_signal}",
        (20, 48),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        display_color,
        2
    )


    # ========================================================
    # SAVE
    # ========================================================

    out.write(frame)


    # ========================================================
    # SHOW
    # ========================================================

    cv2.imshow(
        "Traffic Intelligence",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ============================================================
# CLEANUP
# ============================================================

video.release()
out.release()
cv2.destroyAllWindows()


# ============================================================
# SAVE VEHICLE DETAILS
# ============================================================

with open(DETAILS_PATH, "w") as file:
    json.dump(vehicle_details, file, indent=4)


print()
print("======================================")
print("TRAFFIC PROCESSING COMPLETE")
print("======================================")
print("Result:", OUTPUT_PATH)
print("Vehicle details:", DETAILS_PATH)
print("Vehicles detected:", len(vehicle_details))