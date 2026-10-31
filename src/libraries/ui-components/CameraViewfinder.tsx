/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CameraX-Style Viewfinder Component
 * Custom camera view featuring dynamic alignment guides for crop leaves,
 * 3-pad soil test strips, and harvested produce sizing rings.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Zap, ZapOff, Grid, Image as ImageIcon, Check, Sparkles } from 'lucide-react';
import { InspectionDomain } from '../data-processing/types.ts';

interface CameraViewfinderProps {
  domain: InspectionDomain;
  isProcessing: boolean;
  onCaptureImageData: (imageData: ImageData, previewUrl?: string) => void;
  onOpenPresetGallery: () => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  domain,
  isProcessing,
  onCaptureImageData,
  onOpenPresetGallery
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
        setHasCameraPermission(true);
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setHasCameraPermission(false);
      setStreamActive(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Handle screen tap to focus
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 1200);
  };

  // Capture frame from active camera video
  const captureFrame = () => {
    if (isProcessing) return;

    if (!videoRef.current || !streamActive) {
      // If camera stream is not active, trigger preset or file upload
      onOpenPresetGallery();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    onCaptureImageData(imageData, dataUrl);
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onCaptureImageData(imgData, event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Flip camera between front/back
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="relative w-full aspect-4/3 sm:aspect-16/11 bg-black rounded-3xl overflow-hidden border border-stone-800 shadow-2xl select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileUpload}
      />

      {/* Live Video Feed or Fallback */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-opacity duration-300 ${streamActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* If stream is inactive (camera blocked or sandbox without webcam), show active guidance viewport */}
      {!streamActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-stone-800 to-stone-950">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
            <Camera className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h4 className="text-base font-semibold text-stone-100 mb-1">Camera Stream Standby</h4>
          <p className="text-xs text-stone-400 max-w-xs mb-4">
            Position specimen or tap below to choose authentic field specimen presets (Tomato Blight, Soil Test Strip, Ripeness Grades).
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onOpenPresetGallery}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Load Field Samples
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition-all flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        </div>
      )}

      {/* Interactive Touch Overlay for Tap-to-Focus */}
      <div 
        onClick={handleViewfinderClick}
        className="absolute inset-0 cursor-crosshair z-10"
      >
        {/* Dynamic Alignment Guide Overlays based on active domain */}
        {domain === 'plant_health' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Leaf Outline HUD Guide */}
            <div className="relative w-64 h-80 border-2 border-dashed border-emerald-400/60 rounded-[50%_50%_50%_50%_/_70%_70%_30%_30%] flex items-center justify-center backdrop-brightness-105">
              {/* Central Leaf Vein Guide */}
              <div className="absolute top-4 bottom-6 w-0.5 bg-emerald-400/40 border-dashed border-l border-emerald-400/70" />
              <div className="absolute -top-7 px-3 py-1 bg-black/70 backdrop-blur-md border border-emerald-500/40 rounded-full text-[11px] text-emerald-300 font-medium">
                Align Single Leaf Within Contour
              </div>
              <div className="absolute bottom-2 text-[10px] text-stone-400">
                Center on suspicious lesions or spots
              </div>
            </div>
          </div>
        )}

        {domain === 'soil_health' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Soil Test Strip 3-Pad Box Guide */}
            <div className="w-80 h-32 border-2 border-amber-400/70 rounded-2xl flex flex-col justify-between p-3 bg-black/30 backdrop-blur-[2px]">
              <div className="flex justify-between items-center text-[11px] text-amber-300 font-medium border-b border-amber-400/30 pb-1">
                <span>3-Pad N-P-K Alignment Window</span>
                <span className="text-[10px] text-stone-400">Natural Daylight</span>
              </div>
              {/* 3 Pad Sensor Reticles */}
              <div className="grid grid-cols-3 gap-3 my-auto">
                <div className="h-14 border border-dashed border-amber-400/60 rounded-lg flex flex-col items-center justify-center bg-amber-500/10">
                  <span className="text-xs font-bold text-amber-300">PAD 1</span>
                  <span className="text-[10px] text-stone-400">Nitrogen [N]</span>
                </div>
                <div className="h-14 border border-dashed border-sky-400/60 rounded-lg flex flex-col items-center justify-center bg-sky-500/10">
                  <span className="text-xs font-bold text-sky-300">PAD 2</span>
                  <span className="text-[10px] text-stone-400">Phosphorus [P]</span>
                </div>
                <div className="h-14 border border-dashed border-orange-400/60 rounded-lg flex flex-col items-center justify-center bg-orange-500/10">
                  <span className="text-xs font-bold text-orange-300">PAD 3</span>
                  <span className="text-[10px] text-stone-400">Potassium [K]</span>
                </div>
              </div>
              <div className="text-[10px] text-center text-stone-400">
                Hold strip flat 15cm from camera against neutral background
              </div>
            </div>
          </div>
        )}

        {domain === 'produce_quality' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Produce Sizing & Ripeness Oval Guide */}
            <div className="relative w-64 h-64 border-2 border-emerald-400/70 rounded-full flex items-center justify-center bg-black/20">
              {/* Caliper Crosshairs */}
              <div className="absolute inset-x-0 h-[1px] bg-emerald-400/30" />
              <div className="absolute inset-y-0 w-[1px] bg-emerald-400/30" />
              <div className="absolute -top-7 px-3 py-1 bg-black/70 backdrop-blur-md border border-emerald-500/40 rounded-full text-[11px] text-emerald-300 font-medium">
                Fit Fruit / Vegetable in Ring
              </div>
              <div className="absolute bottom-3 text-[10px] text-stone-300 bg-black/50 px-2 py-0.5 rounded">
                Checks Ripeness & Surface Blemishes
              </div>
            </div>
          </div>
        )}

        {/* Rule of Thirds Grid */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-white/10" />
            <div className="border-r border-white/10" />
            <div />
          </div>
        )}

        {/* Tap-to-Focus Reticle */}
        {focusPoint && (
          <div 
            className="absolute w-12 h-12 border-2 border-amber-400 rounded-sm pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          />
        )}
      </div>

      {/* Top Camera HUD Controls */}
      <div className="absolute top-3 inset-x-3 z-20 flex justify-between items-center px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>CameraX Local Pipeline</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Torch toggle */}
          <button
            onClick={() => setTorchEnabled(!torchEnabled)}
            className={`p-2 rounded-xl transition-colors ${torchEnabled ? 'bg-amber-500 text-stone-950' : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'}`}
            title="Toggle Flashlight / Field Illumination"
            aria-label="Toggle Flashlight"
          >
            {torchEnabled ? <Zap size={16} /> : <ZapOff size={16} />}
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl transition-colors ${showGrid ? 'bg-stone-700 text-stone-100' : 'bg-stone-800/80 text-stone-400'}`}
            title="Toggle Grid Lines"
            aria-label="Toggle Grid Lines"
          >
            <Grid size={16} />
          </button>

          {/* Flip camera */}
          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-xl bg-stone-800/80 text-stone-300 hover:bg-stone-700 transition-colors"
            title="Switch Front/Back Lens"
            aria-label="Switch Camera Lens"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Shutter & Preset Controls */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-around">
        {/* Sample library quick selector */}
        <button
          onClick={onOpenPresetGallery}
          className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-stone-300 hover:text-white hover:bg-black/80 transition-all active:scale-95"
        >
          <Sparkles size={18} className="text-emerald-400" />
          <span className="text-[10px] font-medium">Presets</span>
        </button>

        {/* Main CameraX Shutter Trigger */}
        <button
          onClick={captureFrame}
          disabled={isProcessing}
          aria-label="Capture Specimen Image"
          className={`relative w-18 h-18 rounded-full border-4 flex items-center justify-center transition-transform active:scale-90 shadow-xl ${
            isProcessing 
              ? 'border-amber-400 bg-stone-800 cursor-wait' 
              : 'border-white bg-white/20 hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          {isProcessing ? (
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
          )}
        </button>

        {/* Gallery / File Picker */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-stone-300 hover:text-white hover:bg-black/80 transition-all active:scale-95"
        >
          <ImageIcon size={18} className="text-sky-400" />
          <span className="text-[10px] font-medium">Import</span>
        </button>
      </div>
    </div>
  );
};
