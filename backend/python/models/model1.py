import os
import urllib.request
import json

from ultralytics import YOLO


MODEL_URL = "https://github.com/oracl4/RoadDamageDetection/raw/refs/heads/main/models/YOLOv8_Small_RDD.pt"

MODEL_PATH = "YOLOv8_Small_RDD.pt"
IMAGE_PATH = "image.png"

OUTPUT_DIR = r"D:\hackathon\sih 2026\1\backend\python\output"


# --------------------------------------------------
# Download model if it doesn't exist
# --------------------------------------------------

if not os.path.exists(MODEL_PATH):
    print("Downloading YOLOv8 RDD model...")

    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)

    print("Model downloaded!")


# --------------------------------------------------
# Load model
# --------------------------------------------------

model = YOLO(MODEL_PATH)


# --------------------------------------------------
# Check image
# --------------------------------------------------

if not os.path.exists(IMAGE_PATH):
    print(f"Put a road image named '{IMAGE_PATH}' inside this folder.")
    exit()


# --------------------------------------------------
# Run detection
# --------------------------------------------------

print("Running detection...")

results = model.predict(
    source=IMAGE_PATH,
    save=True,
    project=OUTPUT_DIR,
    exist_ok=True
)


# --------------------------------------------------
# Create JSON data
# --------------------------------------------------

json_data = {
    "image": IMAGE_PATH,
    "detections": [],
    "summary": {}
}


for result in results:

    for box in result.boxes:

        # Class ID
        class_id = int(box.cls[0])

        # Class name
        class_name = result.names[class_id]

        # Confidence
        confidence = float(box.conf[0])

        # Bounding box
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

        # Update summary
        if class_name in json_data["summary"]:
            json_data["summary"][class_name] += 1
        else:
            json_data["summary"][class_name] = 1


# --------------------------------------------------
# Save JSON
# --------------------------------------------------

result_folder = os.path.join(OUTPUT_DIR)

os.makedirs(result_folder, exist_ok=True)

json_path = os.path.join(result_folder, "detections.json")

with open(json_path, "w") as f:
    json.dump(json_data, f, indent=4)


# --------------------------------------------------
# Done
# --------------------------------------------------

print("\nDONE!")

print(f"Annotated image: {result_folder}")
print(f"JSON data:       {json_path}")