import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { reminderRoutes } from "./routes/reminderRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrls,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      message: "Buzz IT API is running. Use /api/* endpoints.",
      health: "/api/health",
    });
  });
  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/post", postRoutes);
  // Alias for clients expecting plural resource name
  app.use("/api/posts", postRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/products", productRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  app.use(errorHandler);

  return app;
}
