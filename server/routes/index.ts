import { Router } from "express";
import userRoutes from "./user.routes";
import agentRoutes from "./agent.routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
  });
});

// API Routes
router.use("/users", userRoutes);
router.use("/agents", agentRoutes);

// Handle 404 for API routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

export default router;
