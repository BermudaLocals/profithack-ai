import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastDismissed = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);
      
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    if (isIOSDevice) {
      const iosPromptDismissed = localStorage.getItem('ios-pwa-prompt-dismissed');
      const lastDismissed = iosPromptDismissed ? parseInt(iosPromptDismissed) : 0;
      const daysSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);
      
      if (!iosPromptDismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem(isIOS ? 'ios-pwa-prompt-dismissed' : 'pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || (!showPrompt && !showIOSInstructions)) return null;

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-end justify-center p-4" data-testid="pwa-ios-instructions">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-2xl p-6 max-w-sm w-full animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-white" data-testid="button-close-ios">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-white font-bold text-lg mb-2">Install on iPhone</h3>
          
          <ol className="text-gray-300 text-sm space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
              <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
              <span>Tap <strong className="text-white">"Add"</strong> in the top right</span>
            </li>
          </ol>
          
          <Button onClick={handleDismiss} className="w-full bg-gradient-to-r from-pink-500 to-purple-600" data-testid="button-got-it">
            Got it!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9998] animate-slide-up" data-testid="pwa-install-prompt">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-2xl p-4 shadow-2xl shadow-pink-500/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base">Install PROFITHACK AI</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Get the full app experience on your phone
            </p>
          </div>
          
          <button onClick={handleDismiss} className="text-gray-400 hover:text-white shrink-0" data-testid="button-dismiss-pwa">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="flex-1 border-gray-700 text-gray-300"
            data-testid="button-not-now"
          >
            Not now
          </Button>
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            data-testid="button-install-app"
          >
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useInstallPWA() {
  const [canInstall, setCanInstall] = useState(false);
  
  useEffect(() => {
    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const deferredPrompt = (window as any).deferredPrompt;
      setCanInstall(!isStandalone && !!deferredPrompt);
    };
    
    checkInstallable();
    window.addEventListener('beforeinstallprompt', checkInstallable);
    
    return () => window.removeEventListener('beforeinstallprompt', checkInstallable);
  }, []);
  
  const install = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) return false;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    (window as any).deferredPrompt = null;
    
    return outcome === 'accepted';
  };
  
  return { canInstall, install };
}
