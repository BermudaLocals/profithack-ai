/**
 * Swipeable Incoming Call Interface
 * Accept (swipe right) or Decline (swipe left)
 */

import { useState, useRef } from "react";
import { Phone, X, Video, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface IncomingCallProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCall({ callerName, callerAvatar, callType, onAccept, onDecline }: IncomingCallProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const threshold = 100; // Distance to trigger action

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setDragX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (dragX > threshold) {
      // Swiped right - Accept
      onAccept();
    } else if (dragX < -threshold) {
      // Swiped left - Decline
      onDecline();
    }
    
    setDragX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current;
    setDragX(diff);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (dragX > threshold) {
      onAccept();
    } else if (dragX < -threshold) {
      onDecline();
    }
    
    setDragX(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 to-purple-900/30" />
      
      {/* Call Card */}
      <div className="relative w-full max-w-sm">
        {/* Caller Info */}
        <div className="text-center mb-8 space-y-4">
          {/* Avatar */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse blur-xl opacity-50" />
            <Avatar className="h-32 w-32 border-4 border-white/20 relative">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-4xl font-bold">
                {callerName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller Name */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{callerName}</h2>
            <p className="text-gray-300 text-lg flex items-center justify-center gap-2">
              {callType === 'video' ? (
                <>
                  <Video className="w-5 h-5" />
                  Incoming video call
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Incoming call
                </>
              )}
            </p>
          </div>
        </div>

        {/* Swipe Instructions */}
        <p className="text-center text-gray-400 text-sm mb-6 animate-pulse">
          Swipe left to decline • Swipe right to accept
        </p>

        {/* Swipeable Control */}
        <div className="relative h-20 bg-gray-800/50 rounded-full border-2 border-gray-700 overflow-hidden">
          {/* Background Indicators */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-between px-8 transition-opacity",
            dragX > 50 ? "opacity-100" : "opacity-30"
          )}>
            <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-500" />
            </div>
            <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
          </div>

          {/* Draggable Button */}
          <div
            className="absolute top-2 left-2 bottom-2 w-16 touch-none select-none cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${Math.max(-80, Math.min(dragX, window.innerWidth - 150))}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className={cn(
              "w-full h-full rounded-full flex items-center justify-center transition-colors shadow-lg",
              dragX > threshold ? "bg-green-500" :
              dragX < -threshold ? "bg-red-500" :
              "bg-white"
            )}>
              {dragX > threshold ? (
                <Phone className="w-8 h-8 text-white" />
              ) : dragX < -threshold ? (
                <X className="w-8 h-8 text-white" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons (Fallback) */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onDecline}
            className="flex-1 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center gap-2 text-white font-semibold transition-colors"
            data-testid="button-decline-call"
          >
            <X className="w-6 h-6" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center gap-2 text-white font-semibold transition-colors"
            data-testid="button-accept-call"
          >
            <Phone className="w-6 h-6" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
