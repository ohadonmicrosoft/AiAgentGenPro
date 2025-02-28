import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { setupApiRouter } from "./api/api-router";
import { setupAuthRouter } from "./api/auth-router";
import { setupLogsRouter } from "./api/logs-router";
import { logger } from "./lib/logger";
import { adaptiveRateLimiter } from "./lib/rate-limiter";
import { isDatabaseUpToDate, runMigrations } from "./migrations";
import { serveStatic, setupVite } from "./lib/vite-middleware";

/**
 * Main server entry point - configures Express app with middlewares and routes
 */
async function startServer() {
  // Create Express application
  const app = express();
  
  // Standard middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Apply rate limiting to all API routes
  app.use("/api", adaptiveRateLimiter());

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = (bodyJson, ...args) => {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        logger.debug(logLine);
      }
    });

    next();
  });

  try {
    // Setup database and run migrations if needed
    await setupDatabase();

    // Register API routers
    app.use(setupAuthRouter());
    app.use(setupApiRouter());
    app.use(setupLogsRouter());

    // Setup Vite for development or static file serving for production
    if (process.env.NODE_ENV === "development") {
      const { createServer } = await import("http");
      const server = createServer(app);
      await setupVite(app, server);
      
      // Start server
      const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 5000;
      server.listen(
        {
          port,
          host: "0.0.0.0",
          reusePort: true,
        },
        () => {
          logger.info(`Server started and listening on port ${port}`);
        },
      );

      setupGracefulShutdown(server);
      return server;
    } else {
      serveStatic(app);
      
      // Start server
      const { createServer } = await import("http");
      const server = createServer(app);
      const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 5000;
      server.listen(
        {
          port,
          host: "0.0.0.0",
          reusePort: true,
        },
        () => {
          logger.info(`Server started and listening on port ${port} in production mode`);
        },
      );

      setupGracefulShutdown(server);
      return server;
    }
  } catch (error: any) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }

  // Global error handler - must be registered after all routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(`API Error: ${status} - ${message}`, {
      error: err.message,
      stack: err.stack,
      status,
    });

    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  });
}

/**
 * Run database migrations if needed
 */
async function setupDatabase() {
  // Skip migrations if using mock storage
  if (process.env.USE_MOCK_STORAGE === "true") {
    logger.info("Using mock storage - skipping database migrations");
    return;
  }

  try {
    // Check and run migrations before starting the server
    logger.info("Checking database migrations status");
    const isUpToDate = await isDatabaseUpToDate();

    if (!isUpToDate) {
      logger.info("Database needs migration, running migrations now");
      await runMigrations();
    } else {
      logger.info("Database is up to date, no migrations needed");
    }
  } catch (error: any) {
    // Log the error but don't fail startup - we have mock fallback
    logger.error("Database migration check failed", {
      error: error.message,
      stack: error.stack,
    });

    if (process.env.NODE_ENV === "production") {
      // In production, database issues are critical
      throw new Error("Database setup failed in production environment");
    } else {
      // In development, we can continue with mock storage
      logger.warn(
        "Continuing with mock storage due to database migration failure",
      );
      process.env.USE_MOCK_STORAGE = "true";
    }
  }
}

/**
 * Setup handlers for graceful shutdown
 */
function setupGracefulShutdown(server: any) {
  const shutdown = async () => {
    logger.info("Shutting down server...");
    server.close(() => {
      logger.info("Server shutdown complete");
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      logger.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

export { startServer }; 