import os
import uuid
import shutil
import datetime
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pymongo

# Import ML model inference modules
from models.model1 import predict_image as rdd_predict_image, predict_video as rdd_predict_video
from models.model3 import process_traffic_image, process_traffic_video

# --------------------------------------------------
# Directories
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load .env manually to avoid extra dependencies
env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ[k] = v

BASEMAP_TILE_URL = os.environ.get("BASEMAP_TILE_URL", "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png")

# --------------------------------------------------
# MongoDB Local Connection
# --------------------------------------------------
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "urban_sense_db"
COLLECTION_NAME = "predictions"

mongo_connected = False
db = None
predictions_col = None

try:
    mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    mongo_client.server_info() # Trigger connection check
    db = mongo_client[DB_NAME]
    predictions_col = db[COLLECTION_NAME]
    mongo_connected = True
    print(f"Successfully connected to local MongoDB at {MONGO_URI} (Database: {DB_NAME})")
except Exception as e:
    print(f"Warning: Could not connect to local MongoDB. Error: {e}")

def save_to_mongodb(data: dict):
    if not mongo_connected or predictions_col is None:
        print("MongoDB not connected. Skipping DB save.")
        return None
    try:
        # Clone dictionary and convert ObjectIDs / dates if needed
        doc = dict(data)
        doc["created_at"] = datetime.datetime.utcnow().isoformat()
        result = predictions_col.insert_one(doc)
        print(f"Saved prediction record to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        return None

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="Urban Sense AI Smart City Backend",
    description="FastAPI Backend for Road Infrastructure & Traffic Intelligence with YOLO & MongoDB Integration",
    version="1.0.0"
)

# --------------------------------------------------
# CORS Middleware
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Static Files Mounting
# --------------------------------------------------
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --------------------------------------------------
# Root & Health Check
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Urban Sense AI Backend API",
        "version": "1.0.0",
        "mongodb_connected": mongo_connected,
        "models_available": ["YOLOv8_Small_RDD", "yolo11n"]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "mongodb_connected": mongo_connected,
        "uploads_dir": os.path.exists(UPLOAD_DIR),
        "outputs_dir": os.path.exists(OUTPUT_DIR)
    }

@app.get("/api/config")
def get_config():
    return {
        "basemap_url": BASEMAP_TILE_URL
    }

# --------------------------------------------------
# General Upload & Predict Endpoint (Images & Videos)
# --------------------------------------------------
@app.post("/predict")
async def predict_media(
    file: UploadFile = File(...),
    model_type: str = Form("rdd"),  # "rdd" or "traffic"
    latitude: Optional[float] = Form(28.6139),  # Default New Delhi latitude
    longitude: Optional[float] = Form(77.2090)  # Default New Delhi longitude
):
    """
    Unified Endpoint for Road Damage & Traffic AI Inference on Images and Videos.
    Saves results (no_of_predicted, latitude, longitude) to local MongoDB.
    """
    content_type = file.content_type or ""
    filename = file.filename or "upload"
    extension = Path(filename).suffix.lower()

    if not extension:
        if "video" in content_type:
            extension = ".mp4"
        else:
            extension = ".jpg"

    unique_id = str(uuid.uuid4())
    upload_filename = f"{unique_id}{extension}"
    upload_path = os.path.join(UPLOAD_DIR, upload_filename)

    # Save uploaded file
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {str(e)}")

    is_video = "video" in content_type or extension in [".mp4", ".avi", ".mov", ".mkv", ".webm"]
    output_filename = f"out_{unique_id}{'.mp4' if is_video else '.jpg'}"

    try:
        if is_video:
            if model_type == "traffic":
                result = process_traffic_video(upload_path, output_filename)
            else:
                result = rdd_predict_video(upload_path, output_filename)
        else:
            if model_type == "traffic":
                result = process_traffic_image(upload_path, output_filename)
            else:
                result = rdd_predict_image(upload_path, output_filename)

        # Extract number of predicted detections
        no_of_predicted = (
            result.get("total_defects") or 
            result.get("total_vehicles") or 
            result.get("total_tracked_vehicles") or 
            0
        )

        # Structure payload for MongoDB storage as requested
        mongo_record = {
            "no_of_predicted": no_of_predicted,
            "long": float(longitude) if longitude is not None else 77.2090,
            "lang": float(latitude) if latitude is not None else 28.6139
        }

        # Store in local MongoDB
        mongo_id = save_to_mongodb(mongo_record)

        return {
            "success": True,
            "filename": filename,
            "is_video": is_video,
            "model_type": model_type,
            "no_of_predicted": no_of_predicted,
            "latitude": mongo_record["lang"],
            "longitude": mongo_record["long"],
            "mongodb_saved": bool(mongo_id),
            "mongodb_id": mongo_id,
            "result": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    finally:
        # Clean up temporary upload file
        if os.path.exists(upload_path):
            try:
                os.remove(upload_path)
            except Exception:
                pass

# --------------------------------------------------
# Video Specific Prediction Endpoint
# --------------------------------------------------
@app.post("/predict-video")
async def predict_video_endpoint(
    video: UploadFile = File(...),
    model_type: str = Form("rdd"),
    latitude: Optional[float] = Form(28.6139),
    longitude: Optional[float] = Form(77.2090)
):
    return await predict_media(file=video, model_type=model_type, latitude=latitude, longitude=longitude)

# --------------------------------------------------
# MongoDB History & Telemetry APIs
# --------------------------------------------------
@app.get("/api/predictions")
def get_stored_predictions(limit: int = 50):
    """
    Fetch stored predictions from local MongoDB.
    """
    if not mongo_connected or predictions_col is None:
        return {"success": False, "message": "MongoDB is not connected", "data": []}

    try:
        cursor = predictions_col.find().sort("created_at", -1).limit(limit)
        records = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            records.append(doc)
        return {"success": True, "count": len(records), "data": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/traffic-summary")
def get_traffic_summary():
    return {
        "vehiclesDetectedToday": 142850,
        "trafficIndex": 74,
        "congestedZonesCount": 8,
        "avgFleetSpeed": "38 km/h"
    }

@app.get("/api/defects")
def get_defects():
    return {
        "total_defects": 142,
        "potholes": 84,
        "cracks": 58
    }