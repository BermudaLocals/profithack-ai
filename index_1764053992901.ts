import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import contentRoutes from "./api/routes/contentRoutes";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware Setup ---

// Security middleware
app.use(helmet());

// CORS setup (allowing all origins for simplicity, but should be restricted in production)
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes Setup ---

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "ELITE2026 AI Creator Platform",
    version: process.env.npm_package_version || "1.0.0"
  });
});

// API Routes
app.use("/api/v1/content", contentRoutes);

// --- Error Handling Middleware ---

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});

// --- Server Start ---

app.listen(port, () => {
  console.log(`[Server] ELITE2026 AI Platform running at http://localhost:${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
