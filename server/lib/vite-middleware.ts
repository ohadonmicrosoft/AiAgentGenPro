import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger";

/**
 * Sets up Vite middleware for development mode
 * This allows us to use Vite's development server features
 */
export async function setupVite(app: express.Application, server: any) {
  logger.info("Setting up Vite middleware for development");

  try {
    // Import Vite dynamically (only used in development)
    const { createServer: createViteServer } = await import("vite");

    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(process.cwd(), "client"),
    });

    // Apply Vite's HMR middleware
    app.use(vite.middlewares);

    // Serve HTML with Vite transforms
    app.use("*", async (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }

      try {
        const url = req.originalUrl;
        // 1. Read index.html
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "client/index.html"),
          "utf-8",
        );

        // 2. Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the transformed HTML
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        logger.error("Vite transform error", {
          error: e.message,
          stack: e.stack,
        });

        // Provide better error messages in browser console
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

    logger.info("Vite middleware setup complete");
    return server;
  } catch (error: any) {
    logger.error("Failed to setup Vite middleware", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Serves static files in production mode
 */
export function serveStatic(app: express.Application) {
  logger.info("Setting up static file serving for production");

  const clientDist = path.resolve(process.cwd(), "client/dist");

  // Check if the client/dist directory exists
  if (!fs.existsSync(clientDist)) {
    logger.error("Static files directory does not exist", { path: clientDist });
    throw new Error(`Static files directory does not exist: ${clientDist}`);
  }

  // Serve static files with appropriate caching
  app.use(
    express.static(clientDist, {
      maxAge: "7d", // Cache static assets for 7 days
      index: false, // Don't serve index.html automatically
    }),
  );

  // Serve index.html for all non-API routes (SPA support)
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }

    try {
      const indexPath = path.join(clientDist, "index.html");
      res.sendFile(indexPath);
    } catch (error: any) {
      logger.error("Failed to serve index.html", {
        path: req.path,
        error: error.message,
      });
      next(error);
    }
  });

  logger.info("Static file serving setup complete");
}
