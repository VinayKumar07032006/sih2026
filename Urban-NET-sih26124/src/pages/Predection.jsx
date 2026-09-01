import React, { useState } from 'react';
import {
  Upload,
  Video,
  Play,
  Database,
  CheckCircle2,
  Loader2,
  X,
  FileVideo,
  BrainCircuit
} from 'lucide-react';

export const Prediction = () => {
  const [video, setVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictedVideo, setPredictedVideo] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    setVideo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPredictedVideo(null);
    setSaved(false);
  };

  const handlePrediction = async () => {
    if (!video) return;

    setIsPredicting(true);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append('video', video);

      /*
       * Connect this to your FastAPI backend:
       *
       * const response = await fetch(
       *   'http://localhost:8000/predict',
       *   {
       *     method: 'POST',
       *     body: formData
       *   }
       * );
       *
       * const data = await response.json();
       *
       * setPredictedVideo(data.predicted_video);
       */

      // Demo prediction delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // For demo, showing original video
      setPredictedVideo(previewUrl);
      setSaved(true);

    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const clearVideo = () => {
    setVideo(null);
    setPreviewUrl(null);
    setPredictedVideo(null);
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
              <h1 className="text-lg font-bold text-white">
                AI VIDEO PREDICTION
              </h1>

              <p className="text-xs text-slate-400">
                Upload road footage for automated infrastructure analysis
              </p>
            </div>

          </div>

          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full">
            EDGE AI READY
          </span>

        </div>

      </div>


      {/* UPLOAD SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">

        <div className="flex items-center gap-2 mb-4">

          <Upload className="w-4 h-4 text-blue-400" />

          <span className="text-sm font-bold text-white">
            VIDEO INPUT
          </span>

        </div>


        {!video ? (

          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/50">

            <div className="bg-blue-500/10 p-4 rounded-full mb-3">
              <Video className="w-8 h-8 text-blue-400" />
            </div>

            <p className="text-sm font-bold text-slate-200">
              Upload Road Video
            </p>

            <p className="text-xs text-slate-500 mt-1">
              MP4, AVI, MOV supported
            </p>

            <span className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition">
              Select Video
            </span>

            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />

          </label>

        ) : (

          <div className="space-y-4">

            {/* FILE INFO */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">

              <div className="flex items-center gap-3">

                <div className="bg-blue-500/10 p-2 rounded">
                  <FileVideo className="w-5 h-5 text-blue-400" />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    {video.name}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {(video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

              </div>

              <button
                onClick={clearVideo}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>

            </div>


            {/* VIDEO PREVIEW */}
            {previewUrl && (

              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">

                <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">

                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Input Video Preview
                  </span>

                  <span className="text-[10px] text-blue-400 font-mono">
                    SOURCE FOOTAGE
                  </span>

                </div>

                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-112.5 object-contain bg-black"
                />

              </div>

            )}

          </div>

        )}

      </div>


      {/* PREDICTION BUTTON */}
      {video && (

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

          <button
            onClick={handlePrediction}
            disabled={isPredicting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition"
          >

            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                RUNNING AI PREDICTION...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                RUN AI PREDICTION
              </>
            )}

          </button>

        </div>

      )}


      {/* PREDICTION RESULT */}
      {predictedVideo && (

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">

            <div className="flex items-center gap-2">

              <CheckCircle2 className="w-5 h-5 text-emerald-400" />

              <div>
                <span className="text-sm font-bold text-white">
                  PREDICTION RESULT
                </span>

                <p className="text-[10px] text-slate-500">
                  AI processed road footage
                </p>
              </div>

            </div>

            {saved && (

              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-1 rounded font-bold">
                <Database className="w-3 h-3" />
                STORED IN DATABASE
              </span>

            )}

          </div>


          {/* PREDICTED VIDEO */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">

            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">

              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Predicted Video
              </span>

              <span className="text-[10px] text-emerald-400 font-mono">
                YOLO OUTPUT
              </span>

            </div>

            <video
              src={predictedVideo}
              controls
              className="w-full max-h-125 object-contain bg-black"
            />

          </div>


          {/* PREDICTION STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase">
                Detection Status
              </p>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                Completed
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase">
                AI Model
              </p>
              <p className="text-sm font-bold text-blue-400 mt-1">
                YOLO
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase">
                Video Status
              </p>
              <p className="text-sm font-bold text-white mt-1">
                Processed
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase">
                Database
              </p>
              <p className="text-sm font-bold text-purple-400 mt-1">
                Saved
              </p>
            </div>

          </div>

        </div>

      )}

    </div>
  );
};