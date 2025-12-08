import express, { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express) {
  try {
    const { createServer } = await import("vite");
    
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "../client"),
    });
    
    app.use(vite.middlewares);
    console.log("✅ Vite dev server configured");
  } catch (error) {
    console.log("⚠️ Vite not available - serving static files");
    serveStatic(app);
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../client/dist");
  const publicPath = path.resolve(__dirname, "../client/public");
  
  app.use(express.static(distPath));
  app.use(express.static(publicPath));
  
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) {
        res.sendFile(path.join(publicPath, "index.html"));
      }
    });
  });
}

export function log(message: string, source: string = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}
