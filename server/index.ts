import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/healthz", (_req, res) => res.send("OK"));

// Serve static files
const clientPath = path.resolve(__dirname, "../public");
app.use(express.static(clientPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

const PORT = parseInt(process.env.PORT || "5000");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
