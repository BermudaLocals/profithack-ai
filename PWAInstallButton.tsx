import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, X } from 'lucide-react';
import logoImage from '@assets/logo6_1763894382467.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (isInstalled) {
    return null;
  }

  if (isIOS) {
    return (
      <div className="relative inline-block">
        <Button
          onClick={() => setShowInstallPrompt(!showInstallPrompt)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/30"
          data-testid="button-install-app"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Install App
        </Button>

        {showInstallPrompt && (
          <div className="absolute top-full mt-2 right-0 w-80 bg-gray-900 border border-cyan-500/30 rounded-lg p-4 shadow-2xl z-50">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Install PROFITHACK AI</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📱 Tap the <strong>Share</strong> button</p>
              <p>➕ Select <strong>"Add to Home Screen"</strong></p>
              <p>✅ Tap <strong>"Add"</strong> to install</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
              Works like a native app with offline access!
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!deferredPrompt || !showInstallPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/30 animate-pulse"
      data-testid="button-install-app"
    >
      <Download className="w-4 h-4 mr-2" />
      Download App
    </Button>
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const hasSeenBanner = localStorage.getItem('pwa-banner-dismissed');
    if (hasSeenBanner) return;

    if (isIOSDevice) {
      setShowBanner(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed from banner');
    }

    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-900/95 to-blue-900/95 backdrop-blur-xl border-t border-cyan-500/30 p-4 z-50 shadow-2xl shadow-cyan-500/20">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg shadow-lg overflow-hidden">
            <img src={logoImage} alt="PROFITHACK AI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-white">Get the PROFITHACK AI App</h3>
            <p className="text-sm text-cyan-200">
              {isIOS 
                ? "Install for offline access and faster performance" 
                : "Works offline • Faster • Native experience"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <Button
              onClick={handleInstall}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-semibold"
              data-testid="button-install-banner"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
          )}
          {isIOS && (
            <div className="text-xs text-cyan-200 max-w-xs">
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
            </div>
          )}
          <button
            onClick={handleDismiss}
            className="text-gray-300 hover:text-white p-2"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
