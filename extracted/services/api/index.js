import express from "express";
import cors from "cors";
import client from "prom-client";
import pkg from "pg";
import Redis from "ioredis";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const redis = new Redis(process.env.REDIS_URL);

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get("/healthz", async (req, res) => {
  try {
    await pool.query("select 1");
    await redis.ping();
    res.json({ ok: true, time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/readyz", (req, res) => res.send("ok"));
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/api/v1/cta", (req, res) => {
  res.json({
    hero: "Stop Scrolling. Start Building.",
    url: "https://ProfitHackAI.com"
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API listening on " + port));
