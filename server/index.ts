import express from "express";
import compression from "compression";
import * as http from "http"; // <-- 1. IMPORT HTTP MODULE
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from 'ws';
import { initializeInteractionService } from './services/interactionService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- NEW WEBSOCKET SERVER INITIALIZATION ---

// 2. CREATE AN HTTP SERVER FROM THE EXPRESS APP
const server = http.createServer(app);

// Create a new WebSocket server, attaching it to the HTTP server
// This allows us to handle both HTTP and WebSocket traffic on the same port
const wss = new WebSocketServer({ noServer: true });

// Initialize our interaction service with the WebSocket server
// This will handle all connection logic and message routing
initializeInteractionService(wss);

// Upgrade HTTP requests to WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

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
// 3. USE SERVER.LISTEN INSTEAD OF APP.LISTEN
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
