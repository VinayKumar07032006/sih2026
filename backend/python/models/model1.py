import os
import urllib.request
import cv2
from ultralytics import YOLO

# --------------------------------------------------
# Paths & Config
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_DIR = os.path.dirname(BASE_DIR)
OUTPUT_DIR = os.path.join(PYTHON_DIR, "outputs")

MODEL_URL = "https://github.com/oracl4/RoadDamageDetection/raw/refs/heads/main/models/YOLOv8_Small_RDD.pt"
MODEL_PATH = os.path.join(BASE_DIR, "YOLOv8_Small_RDD.pt")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# --------------------------------------------------
# Download model if not exists
# --------------------------------------------------
if not os.path.exists(MODEL_PATH):
    print("Downloading YOLOv8 RDD model...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Model downloaded successfully!")

# --------------------------------------------------
# Load model ONCE
# --------------------------------------------------
print("Loading YOLOv8 RDD model...")
model = YOLO(MODEL_PATH)
print("YOLOv8 RDD model loaded!")

# --------------------------------------------------
# Predict Image Function
# --------------------------------------------------
def predict_image(image_path: str, output_name: str = "result.jpg"):
    """
    Runs road damage detection on an input image.
    """
    print(f"Running Road Damage Detection on Image: {image_path}")
    
    save_path = os.path.join(OUTPUT_DIR, output_name)
    
    results = model.predict(
        source=image_path,
        conf=0.25,
        save=False
    )
    
    json_data = {
        "model": "YOLOv8_Small_RDD",
        "type": "image",
        "image": os.path.basename(image_path),
        "detections": [],
        "summary": {},
        "total_defects": 0,
        "annotated_url": f"/outputs/{output_name}"
    }

    if len(results) > 0:
        res = results[0]
        # Save annotated image plot directly
        res_plot = res.plot()
        cv2.imwrite(save_path, res_plot)

        for box in res.boxes:
            class_id = int(box.cls[0])
            class_name = res.names[class_id]
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detection = {
                "class": class_name,
                "confidence": round(confidence, 4),
                "bounding_box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            }
            json_data["detections"].append(detection)

            json_data["summary"][class_name] = json_data["summary"].get(class_name, 0) + 1
            json_data["total_defects"] += 1

    print(f"Image detection complete! Found {json_data['total_defects']} defects.")
    return json_data

# --------------------------------------------------
# Predict Video Function
# --------------------------------------------------
def predict_video(video_path: str, output_name: str = "result.mp4"):
    """
    Runs road damage detection on a video file frame by frame.
    """
    print(f"Running Road Damage Detection on Video: {video_path}")
    
    save_path = os.path.join(OUTPUT_DIR, output_name)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file")
        
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
    
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(save_path, fourcc, int(fps), (width, height))

    total_defects = 0
    summary = {}
    frame_count = 0

    results = model.predict(
        source=video_path,
        conf=0.25,
        stream=True
    )

    for result in results:
        frame_count += 1
        annotated_frame = result.plot()
        out.write(annotated_frame)

        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                summary[class_name] = summary.get(class_name, 0) + 1
                total_defects += 1

    cap.release()
    out.release()

    json_data = {
        "model": "YOLOv8_Small_RDD",
        "type": "video",
        "video": os.path.basename(video_path),
        "frames_processed": frame_count,
        "summary": summary,
        "total_defects": total_defects,
        "annotated_url": f"/outputs/{output_name}"
    }

    print(f"Video detection complete! Processed {frame_count} frames, {total_defects} defect occurrences.")
    return json_data
