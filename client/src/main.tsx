import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PROFITHACK PWA: Service Worker registered', registration.scope);
      })
      .catch((error) => {
        console.log('PROFITHACK PWA: Service Worker registration failed', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
