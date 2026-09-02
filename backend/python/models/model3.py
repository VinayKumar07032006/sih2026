import os
import json
import cv2
# pyrefly: ignore [missing-import]
from ultralytics import YOLO

# ============================================================
# PATHS
# ============================================================
import tempfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_DIR = os.path.dirname(BASE_DIR)
TEMP_BASE = tempfile.gettempdir()
OUTPUT_DIR = os.path.join(TEMP_BASE, "urbansense_outputs")

MODEL_PATH = os.path.join(BASE_DIR, "yolo11n.pt")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# LOAD MODEL
# ============================================================
print("Loading YOLO11n Traffic Model...")
model = YOLO(MODEL_PATH)
print("YOLO11n Traffic Model Loaded!")

VEHICLES = {
    2: "CAR",
    3: "MOTORCYCLE",
    5: "BUS",
    7: "TRUCK"
}
TRAFFIC_LIGHT = 9

# ============================================================
# SIGNAL COLOR HELPER
# ============================================================
def get_signal_color(crop):
    if crop is None or crop.size == 0:
        return "UNKNOWN"

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)

    # RED
    red1 = cv2.inRange(hsv, (0, 80, 80), (10, 255, 255))
    red2 = cv2.inRange(hsv, (170, 80, 80), (180, 255, 255))
    red_pixels = cv2.countNonZero(red1) + cv2.countNonZero(red2)

    # YELLOW
    yellow = cv2.inRange(hsv, (15, 80, 80), (35, 255, 255))
    yellow_pixels = cv2.countNonZero(yellow)

    # GREEN
    green = cv2.inRange(hsv, (35, 60, 60), (90, 255, 255))
    green_pixels = cv2.countNonZero(green)

    values = {
        "RED": red_pixels,
        "YELLOW": yellow_pixels,
        "GREEN": green_pixels
    }

    best_color = max(values, key=values.get)

    if values[best_color] < 5:
        return "UNKNOWN"

    return best_color

# ============================================================
# PROCESS TRAFFIC IMAGE
# ============================================================
def process_traffic_image(image_path: str, output_name: str = "traffic_result.jpg"):
    print(f"Processing Traffic Image: {image_path}")
    
    save_path = os.path.join(OUTPUT_DIR, output_name)
    
    results = model.predict(
        source=image_path,
        classes=[2, 3, 5, 7, 9],
        conf=0.30,
        save=False
    )
    
    summary = {"CAR": 0, "MOTORCYCLE": 0, "BUS": 0, "TRUCK": 0, "TRAFFIC_LIGHT": 0}
    detections = []
    signal_status = "UNKNOWN"

    if len(results) > 0:
        res = results[0]
        annotated = res.plot()
        cv2.imwrite(save_path, annotated)

        for box in res.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            if class_id == TRAFFIC_LIGHT:
                summary["TRAFFIC_LIGHT"] += 1
                crop = res.orig_img[int(y1):int(y2), int(x1):int(x2)]
                signal_status = get_signal_color(crop)
            elif class_id in VEHICLES:
                v_name = VEHICLES[class_id]
                summary[v_name] = summary.get(v_name, 0) + 1
                
            detections.append({
                "class": VEHICLES.get(class_id, "TRAFFIC_LIGHT" if class_id == 9 else "OBJECT"),
                "confidence": round(confidence, 4),
                "bounding_box": {"x1": round(x1, 2), "y1": round(y1, 2), "x2": round(x2, 2), "y2": round(y2, 2)}
            })

    total_vehicles = summary["CAR"] + summary["MOTORCYCLE"] + summary["BUS"] + summary["TRUCK"]

    return {
        "model": "yolo11n",
        "type": "image",
        "image": os.path.basename(image_path),
        "total_vehicles": total_vehicles,
        "signal_status": signal_status,
        "summary": summary,
        "detections": detections,
        "annotated_url": f"/outputs/{output_name}"
    }

# ============================================================
# PROCESS TRAFFIC VIDEO
# ============================================================
def process_traffic_video(video_path: str, output_name: str = "traffic_result.mp4"):
    print(f"Processing Traffic Video (Headless): {video_path}")
    
    save_path = os.path.join(OUTPUT_DIR, output_name)

    video = cv2.VideoCapture(video_path)
    if not video.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = int(video.get(cv2.CAP_PROP_FPS)) or 25
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

    out = cv2.VideoWriter(
        save_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height)
    )

    vehicle_details = {}
    signal_states = []
    frame_count = 0

    for result in model.track(
        source=video_path,
        stream=True,
        persist=True,
        tracker="bytetrack.yaml",
        classes=[2, 3, 5, 7, 9],
        conf=0.30
    ):
        frame_count += 1
        frame = result.orig_img.copy()

        if result.boxes is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            ids = result.boxes.id.cpu().numpy() if result.boxes.id is not None else [None] * len(boxes)

            for box, cls, confidence, track_id in zip(boxes, classes, confidences, ids):
                x1, y1, x2, y2 = map(int, box)
                class_id = int(cls)

                if class_id == TRAFFIC_LIGHT:
                    crop = frame[max(0, y1):min(height, y2), max(0, x1):min(width, x2)]
                    signal_color = get_signal_color(crop)
                    signal_states.append(signal_color)

                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
                    cv2.putText(frame, f"SIGNAL: {signal_color}", (x1, max(y1 - 10, 20)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

                elif class_id in VEHICLES:
                    vehicle_type = VEHICLES[class_id]
                    vehicle_id = int(track_id) if track_id is not None else -1

                    if vehicle_id != -1:
                        vehicle_details[str(vehicle_id)] = {
                            "vehicle_id": vehicle_id,
                            "vehicle_type": vehicle_type,
                            "confidence": round(float(confidence), 3)
                        }

                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"{vehicle_type} #{vehicle_id}", (x1, max(y1 - 10, 20)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        out.write(frame)

    video.release()
    out.release()

    overall_signal = "UNKNOWN"
    if "RED" in signal_states:
        overall_signal = "RED"
    elif "GREEN" in signal_states:
        overall_signal = "GREEN"
    elif "YELLOW" in signal_states:
        overall_signal = "YELLOW"

    # Count breakdown by vehicle type
    type_counts = {"CAR": 0, "MOTORCYCLE": 0, "BUS": 0, "TRUCK": 0}
    for v in vehicle_details.values():
        vtype = v["vehicle_type"]
        if vtype in type_counts:
            type_counts[vtype] += 1

    return {
        "model": "yolo11n",
        "type": "video",
        "video": os.path.basename(video_path),
        "frames_processed": frame_count,
        "total_tracked_vehicles": len(vehicle_details),
        "vehicle_breakdown": type_counts,
        "overall_signal": overall_signal,
        "annotated_url": f"/outputs/{output_name}"
    }
