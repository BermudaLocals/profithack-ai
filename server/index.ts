import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { db, testConnection } from "./db";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rofithack-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/healthz", (_req, res) => res.send("OK"));

async function start() {
  console.log("Starting server...");
  
  try {
    await testConnection();
    console.log("Database connected");
  } catch (e) {
    console.error("Database failed:", e);
  }

  await registerRoutes(app);

  // Serve static files (production only)
  const distPath = path.resolve(__dirname, "../public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const PORT = parseInt(process.env.PORT || "5000");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
