import { useEffect, useState } from "react";

export function AppLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300); // Small delay before showing app
          return 100;
        }
        return prev + 10;
      });
    }, 100); // 100ms intervals = 1 second total

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 flex flex-col items-center justify-center">
      {/* 3D Logo Area */}
      <div className="mb-8 relative">
        <div className="text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
          PROFITHACK
        </div>
        <div className="text-xl text-cyan-300 text-center mt-2 font-light tracking-widest">
          AI
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <div className="mt-4 text-white/60 text-sm animate-pulse">
        Loading experience...
      </div>
    </div>
  );
}
