import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PROFITHACK PWA: Service Worker registered', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PROFITHACK PWA: New version available');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('PROFITHACK PWA: Service Worker registration failed', error);
      });
  });
}

let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  (window as any).deferredPrompt = deferredPrompt;
  console.log('PROFITHACK PWA: Install prompt ready');
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  (window as any).deferredPrompt = null;
  console.log('PROFITHACK PWA: App installed successfully!');
});

createRoot(document.getElementById("root")!).render(<App />);
