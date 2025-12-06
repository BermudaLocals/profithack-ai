let updateCheckInterval: number | null = null;

export function registerServiceWorker() {
  // DISABLED IN DEVELOPMENT - Only enable in production with proper sw.js file
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA: Service Worker registered successfully:', registration.scope);
          
          // Check for updates immediately
          registration.update();
          
          // Check for updates every 60 seconds when app is open
          updateCheckInterval = window.setInterval(() => {
            console.log('🔍 PWA: Checking for updates...');
            registration.update();
          }, 60000); // Check every minute
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🆕 PWA: New version found, installing...');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content available, show notification and reload
                    console.log('🔄 PWA: New version installed, reloading app...');
                    showUpdateNotification();
                    
                    // Auto-reload after 3 seconds
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } else {
                    // First install
                    console.log('✅ PWA: Content cached for offline use');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ PWA: Service Worker registration failed:', error);
        });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log(`✅ PWA: App updated to version ${event.data.version}`);
        }
      });
      
      // Clear update interval when page is unloaded
      window.addEventListener('beforeunload', () => {
        if (updateCheckInterval) {
          clearInterval(updateCheckInterval);
        }
      });
    });
  }
}

function showUpdateNotification() {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(236, 72, 153, 0.4);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">🎉 New Update Available!</div>
        <div style="opacity: 0.9; font-size: 13px;">Reloading app in 3 seconds...</div>
      </div>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function showInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 PWA: Install prompt available');
    
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`📱 PWA: User response to install prompt: ${outcome}`);
          deferredPrompt = null;
          installButton.style.display = 'none';
        }
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA: App installed successfully');
    deferredPrompt = null;
  });
}
