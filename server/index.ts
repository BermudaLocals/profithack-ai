import express from 'express';
import { createViteServer } from './vite'; // Adjust path as needed

const app = express();

// ... your other API routes and middleware ...

// Attach Vite or static file serving
await createViteServer(app);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});import { defineConfig } from 'vite';
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
