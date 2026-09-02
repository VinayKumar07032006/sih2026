import os
from ultralytics import YOLO

MODEL_PATH = "yolo11n.pt"
IMAGE_PATH = "test.avif"
OUTPUT_PATH = "traffic_result2.jpg"

# Load model
model = YOLO(MODEL_PATH)

# Run detection
results = model.predict(
    source=IMAGE_PATH,
    conf=0.35
)

# Save result directly in traffic folder
results[0].save(filename=OUTPUT_PATH)

print("Detection complete!")
print(f"Result saved: {OUTPUT_PATH}")