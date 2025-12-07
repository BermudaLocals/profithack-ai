/**
 * PROFITHACK AI - TikTok-Style Camera Recording Interface
 * Exact TikTok camera layout with all controls
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  X, 
  Music2, 
  RotateCcw, 
  Timer, 
  Sparkles,
  LayoutGrid,
  Settings2,
  ChevronDown,
  Scissors,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = ["10m", "60s", "15s"];

type Mode = "post" | "live";
type ContentType = "photo" | "text";

export default function CameraPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("post");
  const [contentType, setContentType] = useState<ContentType>("photo");
  const [selectedDuration, setSelectedDuration] = useState(1); // 60s default
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const startRecording = () => {
    if (mode === "live") {
      setLocation("/go-live");
      return;
    }
    
    if (contentType === "photo") {
      takePhoto();
      return;
    }

    setIsRecording(true);
    setRecordingTime(0);
    
    const maxSeconds = selectedDuration === 0 ? 600 : selectedDuration === 1 ? 60 : 15;
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= maxSeconds) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Preview - Full Screen */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          {/* Close Button */}
          <button
            onClick={() => setLocation("/fyp")}
            className="p-2"
            data-testid="button-close-camera"
          >
            <X className="w-7 h-7 text-white" />
          </button>
          
          {/* Add Sound Button */}
          <button 
            className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2"
            data-testid="button-add-sound"
          >
            <Music2 className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Add sound</span>
          </button>

          {/* Flip Camera */}
          <button 
            onClick={flipCamera}
            className="p-2"
            data-testid="button-flip-camera"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Right Side Toolbar */}
        <div className="absolute right-4 top-24 flex flex-col items-center gap-5 z-10">
          {/* Speed */}
          <button 
            className="flex flex-col items-center"
            data-testid="button-speed"
          >
            <Scissors className="w-6 h-6 text-white rotate-90" />
          </button>
          
          {/* Timer */}
          <button 
            className="flex flex-col items-center"
            data-testid="button-timer"
          >
            <Timer className="w-6 h-6 text-white" />
          </button>
          
          {/* Templates */}
          <button 
            className="flex flex-col items-center"
            data-testid="button-templates"
          >
            <LayoutGrid className="w-6 h-6 text-white" />
          </button>

          {/* Filters */}
          <button 
            className="flex flex-col items-center"
            data-testid="button-filters"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>

          {/* Settings with checkmark */}
          <button 
            className="flex flex-col items-center relative"
            data-testid="button-settings"
          >
            <Settings2 className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* Collapse */}
          <button 
            className="flex flex-col items-center"
            data-testid="button-collapse"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Recording Progress */}
        {isRecording && (
          <div className="absolute top-20 left-4 right-16 z-10">
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${(recordingTime / (selectedDuration === 0 ? 600 : selectedDuration === 1 ? 60 : 15)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="bg-black pt-4 pb-6">
        {/* Duration Selector */}
        <div className="flex justify-center items-center gap-6 mb-4 px-4">
          {DURATION_OPTIONS.map((duration, idx) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(idx)}
              className={cn(
                "text-sm font-medium transition-all",
                selectedDuration === idx 
                  ? "text-white" 
                  : "text-gray-500"
              )}
              data-testid={`button-duration-${duration}`}
            >
              {duration}
            </button>
          ))}
          
          {/* PHOTO / TEXT selector */}
          <div className="flex items-center bg-gray-800 rounded-full p-1 ml-4">
            <button
              onClick={() => setContentType("photo")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                contentType === "photo" 
                  ? "bg-white text-black" 
                  : "text-gray-400"
              )}
              data-testid="button-content-photo"
            >
              PHOTO
            </button>
            <button
              onClick={() => setContentType("text")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                contentType === "text" 
                  ? "bg-white text-black" 
                  : "text-gray-400"
              )}
              data-testid="button-content-text"
            >
              TEXT
            </button>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-center gap-8 mb-6 px-8">
          {/* Gallery/Upload (Green) */}
          <button 
            className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
            onClick={() => setLocation("/upload")}
            data-testid="button-gallery"
          >
            <Image className="w-6 h-6 text-white" />
          </button>

          {/* Main Record Button */}
          <button
            onMouseDown={startRecording}
            onMouseUp={() => isRecording && stopRecording()}
            onTouchStart={startRecording}
            onTouchEnd={() => isRecording && stopRecording()}
            className={cn(
              "relative w-20 h-20 rounded-full transition-all",
              isRecording ? "scale-90" : "scale-100"
            )}
            data-testid="button-record"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white" />
            
            {/* Inner button */}
            <div className={cn(
              "absolute inset-2 rounded-full bg-white transition-all",
              isRecording && "rounded-lg scale-75 bg-red-500"
            )} />
          </button>

          {/* Effects/Templates Preview */}
          <button 
            className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 border border-gray-600"
            data-testid="button-effects-preview"
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-400/50 to-purple-500/50" />
          </button>
        </div>

        {/* LIVE / POST Toggle */}
        <div className="flex justify-center gap-8">
          <button
            onClick={() => {
              setMode("live");
              setLocation("/go-live");
            }}
            className={cn(
              "text-sm font-medium transition-all",
              mode === "live" ? "text-white" : "text-gray-500"
            )}
            data-testid="button-mode-live"
          >
            LIVE
          </button>
          <button
            onClick={() => setMode("post")}
            className={cn(
              "text-sm font-medium transition-all",
              mode === "post" ? "text-white" : "text-gray-500"
            )}
            data-testid="button-mode-post"
          >
            POST
          </button>
        </div>
      </div>
    </div>
  );
}
