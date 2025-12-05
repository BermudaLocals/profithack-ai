import { useEffect, useState } from 'react';
import '../styles/private-call.css';

interface TerminationOverlayProps {
  isActive: boolean;
  reason: string;
  redirectUrl: string;
  onRedirect?: () => void;
}

export function TerminationOverlay({ 
  isActive, 
  reason, 
  redirectUrl,
  onRedirect 
}: TerminationOverlayProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isActive) {
      const duration = 5000;
      const interval = 50;
      const decrement = (100 / duration) * interval;
      
      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(timer);
            if (onRedirect) {
              onRedirect();
            } else {
              window.location.href = redirectUrl;
            }
            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isActive, redirectUrl, onRedirect]);

  const reasonText = reason.replace(/_/g, ' ').toLowerCase();

  return (
    <div 
      id="termination-overlay" 
      className={`absolute inset-0 bg-black flex items-center justify-center ${isActive ? 'active' : ''}`}
    >
      <div 
        id="termination-alert" 
        className="p-8 rounded-xl border-2 border-pink-500 neon-glow-magenta text-center max-w-md"
      >
        <h2 className="text-2xl font-bold text-pink-500 mb-4 text-shadow-neon-magenta">
          Call Terminated
        </h2>
        <p className="text-white mb-6">
          Your call was terminated due to {reasonText}. Redirecting to the Models Gallery in {Math.ceil((progress / 100) * 5)} seconds...
        </p>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            id="redirect-progress" 
            className="h-full bg-cyan-500 transition-all"
            style={{ width: `${progress}%`, transitionDuration: '50ms' }}
          />
        </div>
      </div>
    </div>
  );
}
