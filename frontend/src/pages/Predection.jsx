import React, { useState, useEffect } from 'react';
import {
  Upload,
  Video,
  Play,
  Database,
  CheckCircle2,
  Loader2,
  X,
  FileVideo,
  FileImage,
  BrainCircuit,
  AlertTriangle,
  Layers,
  Car
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const Prediction = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImg, setIsImg] = useState(false);
  const [modelType, setModelType] = useState('rdd'); // 'rdd' (Road Damage) or 'traffic' (Traffic & Signals)
  
  const [predictionData, setPredictionData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [saved, setSaved] = useState(false);

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not fetch live location. Defaults will be used.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please upload a valid image (PNG, JPG, WEBP) or video (MP4, AVI, MOV).');
      return;
    }

    setFile(selectedFile);
    setIsImg(isImage);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setPredictionData(null);
    setErrorMessage(null);
    setSaved(false);
  };

  const handlePrediction = async () => {
    if (!file) return;

    setIsPredicting(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_type', modelType);

      if (location.latitude !== null && location.longitude !== null) {
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
      }

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const data = await response.json();
      setPredictionData(data);
      setSaved(true);

    } catch (error) {
      console.error('Prediction error:', error);
      setErrorMessage(error.message || 'Failed to connect to Python FastAPI Backend.');
    } finally {
      setIsPredicting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setPredictionData(null);
    setErrorMessage(null);
    setSaved(false);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-wide">
                AI Media Prediction & Telemetry
              </h1>
              <p className="text-xs text-slate-400">
                Run live YOLO ML models on road images or footage for defects and traffic intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {location.latitude && (
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                GPS ACTIVE
              </span>
            )}
            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              FASTAPI CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* MODEL SELECTION & UPLOAD SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        
        {/* MODEL SELECTOR */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select AI Detection Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModelType('rdd')}
              className={`p-3 rounded-xl border flex items-center gap-3 text-left transition ${
                modelType === 'rdd'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${modelType === 'rdd' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Road Damage AI (YOLOv8 RDD)</div>
                <div className="text-[10px] text-slate-400">Detects Potholes, Cracks, and Surface Defects</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setModelType('traffic')}
              className={`p-3 rounded-xl border flex items-center gap-3 text-left transition ${
                modelType === 'traffic'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${modelType === 'traffic' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Traffic Intelligence AI (YOLO11)</div>
                <div className="text-[10px] text-slate-400">Tracks Cars, Buses, Trucks, Motorcycles & Signals</div>
              </div>
            </button>
          </div>
        </div>

        {/* UPLOAD BOX */}
        {!file ? (
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl h-56 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/50">
            <div className="bg-blue-500/10 p-4 rounded-full mb-3">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">
              Upload Road Image or Video Footage
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports MP4, AVI, MOV, JPG, PNG, WEBP
            </p>
            <span className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition">
              Select File
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* FILE INFO */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded">
                  {isImg ? <FileImage className="w-5 h-5 text-blue-400" /> : <FileVideo className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{file.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {isImg ? 'IMAGE FILE' : 'VIDEO FOOTAGE'}
                  </p>
                </div>
              </div>

              <button
                onClick={clearFile}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PREVIEW */}
            {previewUrl && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Input Media Preview
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    ORIGINAL SOURCE
                  </span>
                </div>

                {isImg ? (
                  <img
                    src={previewUrl}
                    alt="Source Preview"
                    className="w-full max-h-96 object-contain bg-black"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-96 object-contain bg-black"
                  />
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ERROR DISPLAY */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PREDICTION RUN BUTTON */}
      {file && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <button
            onClick={handlePrediction}
            disabled={isPredicting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                EXECUTING {modelType === 'rdd' ? 'YOLOv8 ROAD DAMAGE' : 'YOLO11 TRAFFIC'} AI MODEL...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                RUN AI MODEL PREDICTION
              </>
            )}
          </button>
        </div>
      )}

      {/* PREDICTION RESULT SECTION */}
      {predictionData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-white uppercase">
                  AI PREDICTION RESULT & ANNOTATION
                </span>
                <p className="text-[10px] text-slate-500">
                  Processed via Python FastAPI backend ({predictionData.model_type === 'rdd' ? 'YOLOv8_Small_RDD.pt' : 'yolo11n.pt'})
                </p>
              </div>
            </div>

            {saved && (
              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2.5 py-1 rounded font-bold">
                <Database className="w-3 h-3" />
                STORED IN SYSTEM DATABASE
              </span>
            )}
          </div>

          {/* ANNOTATED MEDIA PLAYER / IMAGE */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Annotated Model Output
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {predictionData.is_video ? 'ANNOTATED VIDEO STREAM' : 'BOUNDING BOXES PLOTTED'}
              </span>
            </div>

            {predictionData.is_video ? (
              <video
                src={`${BACKEND_URL}${predictionData.result.annotated_url}`}
                controls
                autoPlay
                className="w-full max-h-125 object-contain bg-black"
              />
            ) : (
              <img
                src={`${BACKEND_URL}${predictionData.result.annotated_url}`}
                alt="Annotated Result"
                className="w-full max-h-125 object-contain bg-black"
              />
            )}
          </div>

          {/* PREDICTION SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Model Engine</p>
              <p className="text-sm font-bold text-blue-400 mt-1 font-mono">
                {predictionData.result.model || 'YOLO'}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Detections</p>
              <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                {predictionData.result.total_defects ?? predictionData.result.total_vehicles ?? predictionData.result.total_tracked_vehicles ?? 0}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Traffic Signal</p>
              <p className={`text-sm font-bold mt-1 font-mono ${
                predictionData.result.overall_signal === 'RED' ? 'text-rose-500' :
                predictionData.result.overall_signal === 'GREEN' ? 'text-emerald-400' :
                predictionData.result.overall_signal === 'YELLOW' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {predictionData.result.overall_signal || predictionData.result.signal_status || 'N/A'}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Frames Processed</p>
              <p className="text-sm font-bold text-purple-400 mt-1 font-mono">
                {predictionData.result.frames_processed ?? (predictionData.is_video ? 'Stream' : '1 (Single Image)')}
              </p>
            </div>
          </div>

          {/* BREAKDOWN LIST */}
          {predictionData.result.summary && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Detection Class Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(predictionData.result.summary).map(([cls, count]) => (
                  <div key={cls} className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{cls}</span>
                    <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};