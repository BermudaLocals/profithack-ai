import { useEffect, useState } from 'react';
import masonicLogo from '@assets/../public/logo-masonic.png';

interface RotatingMasonicLogoProps {
  size?: number;
  speed?: number; // rotation speed in seconds
  className?: string;
}

export function RotatingMasonicLogo({ 
  size = 40, 
  speed = 3,
  className = "" 
}: RotatingMasonicLogoProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, (speed * 1000) / 360); // Calculate interval for smooth rotation

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
      }}
      data-testid="rotating-masonic-logo"
    >
      <img
        src={masonicLogo}
        alt="Freemason Logo"
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      />
      <div 
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
}

export function RotatingMasonicLogoCSS({ 
  size = 40,
  className = "" 
}: Omit<RotatingMasonicLogoProps, 'speed'>) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
      }}
      data-testid="rotating-masonic-logo-css"
    >
      <img
        src={masonicLogo}
        alt="Freemason Logo #2"
        className="absolute inset-0 w-full h-full object-contain animate-spin-slow"
      />
      <div 
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
}
