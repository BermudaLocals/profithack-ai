import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // If using React

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client', // Builds client assets to a separate folder
    emptyOutDir: true,
  },
  server: {
    // Your dev server config (irrelevant for production build)
  }
});
