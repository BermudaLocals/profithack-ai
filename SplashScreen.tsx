import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import './SplashScreen.css';

export function SplashScreen() {
  const [, setLocation] = useLocation();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            if (response.ok) {
              setLocation('/');
            } else {
              setLocation('/invite');
            }
          }, 500);
        }, 2000);
      } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => setLocation('/invite'), 500);
        }, 2000);
      }
    };

    checkAuth();
  }, [setLocation]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-pulse">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" fill="none" />
              <text x="60" y="75" textAnchor="middle" fontSize="32" fontWeight="bold" fill="currentColor">
                PHA
              </text>
            </svg>
          </div>
        </div>

        <h1 className="splash-title">ProfitHackAI</h1>
        <p className="splash-subtitle">Create. Monetize. Dominate.</p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
