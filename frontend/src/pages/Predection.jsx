import React, { useState, useEffect } from 'react';
import {
  Upload,
  Play,
  Database,
  CheckCircle2,
  Loader2,
  X,
  FileVideo,
  FileImage,
  Sparkles,
  AlertTriangle,
  Car,
  Layers
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
        }
      );
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
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Computer Vision Studio</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Detection & Video Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload road photography or driving dashcam footage to test our models in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {location.latitude && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                GPS Tagged
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-xl border border-slate-200">
              FastAPI Ready
            </span>
          </div>
        </div>
      </div>

      {/* MODEL SELECTION & UPLOAD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Model Selector Tabs */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Select Detection Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModelType('rdd')}
              className={`p-4 rounded-xl border flex items-start gap-3.5 text-left transition ${
                modelType === 'rdd'
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${modelType === 'rdd' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Road Damage Detection</div>
                <div className="text-xs text-slate-500 mt-0.5">Identifies potholes, surface cracks, and road fissures</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setModelType('traffic')}
              className={`p-4 rounded-xl border flex items-start gap-3.5 text-left transition ${
                modelType === 'traffic'
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${modelType === 'traffic' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Traffic & Signals Intelligence</div>
                <div className="text-xs text-slate-500 mt-0.5">Tracks vehicles, counts density, and reads traffic lights</div>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/10">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Drag and drop media or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP4, AVI, MOV, JPG, PNG, WEBP (up to 50MB)
            </p>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* File Chip */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                  {isImg ? <FileImage className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{file.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {isImg ? 'Image' : 'Video Footage'}
                  </p>
                </div>
              </div>

              <button
                onClick={clearFile}
                className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-slate-100"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Preview */}
            {previewUrl && (
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                <div className="px-4 py-2.5 bg-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">Source Input Preview</span>
                  <span className="text-[10px] text-slate-400 font-mono">Original</span>
                </div>
                {isImg ? (
                  <img
                    src={previewUrl}
                    alt="Source Preview"
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Run Action Button */}
      {file && (
        <button
          onClick={handlePrediction}
          disabled={isPredicting}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
        >
          {isPredicting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing media with {modelType === 'rdd' ? 'Road Damage' : 'Traffic'} AI model...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Detection Analysis</span>
            </>
          )}
        </button>
      )}

      {/* RESULT SECTION */}
      {predictionData && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5 animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Detection Results & Annotated Output</h3>
                <p className="text-xs text-slate-500">Processed by active YOLO neural network</p>
              </div>
            </div>

            {saved && (
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded-xl font-semibold">
                <Database className="w-3.5 h-3.5" />
                Saved to Database
              </span>
            )}
          </div>

          {/* Annotated Media Player */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-200">
            <div className="px-4 py-2.5 bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Annotated Bounding Box Output</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {predictionData.is_video ? 'Video Stream' : 'Boxes Rendered'}
              </span>
            </div>

            {predictionData.is_video ? (
              <video
                src={`${BACKEND_URL}${predictionData.result.annotated_url}`}
                controls
                autoPlay
                className="w-full max-h-125 object-contain"
              />
            ) : (
              <img
                src={`${BACKEND_URL}${predictionData.result.annotated_url}`}
                alt="Annotated Result"
                className="w-full max-h-125 object-contain"
              />
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-500 font-medium">Model</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                {predictionData.result.model || (predictionData.model_type === 'rdd' ? 'YOLOv8-RDD' : 'YOLO11-Traffic')}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-500 font-medium">Total Detections</span>
              <div className="text-sm font-bold text-emerald-700 mt-0.5 font-mono">
                {predictionData.result.total_defects ?? predictionData.result.total_vehicles ?? predictionData.result.total_tracked_vehicles ?? 0}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-500 font-medium">Traffic Light State</span>
              <div className={`text-sm font-bold mt-0.5 font-mono ${
                predictionData.result.overall_signal === 'RED' ? 'text-rose-600' :
                predictionData.result.overall_signal === 'GREEN' ? 'text-emerald-600' :
                predictionData.result.overall_signal === 'YELLOW' ? 'text-amber-600' : 'text-slate-600'
              }`}>
                {predictionData.result.overall_signal || predictionData.result.signal_status || 'N/A'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-500 font-medium">Frames Processed</span>
              <div className="text-sm font-bold text-purple-700 mt-0.5 font-mono">
                {predictionData.result.frames_processed ?? (predictionData.is_video ? 'Stream' : '1 (Single Frame)')}
              </div>
            </div>
          </div>

          {/* Class Breakdown */}
          {predictionData.result.summary && Object.keys(predictionData.result.summary).length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Detected Objects Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(predictionData.result.summary).map(([cls, count]) => (
                  <div key={cls} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between text-xs shadow-2xs">
                    <span className="text-slate-800 font-medium">{cls}</span>
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono px-2 py-0.5 rounded-md">
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