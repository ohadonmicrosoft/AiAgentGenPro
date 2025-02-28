import express from "express";
import { checkAuthenticated, checkAdmin } from "../middlewares/auth-middleware";
import { handleError } from "../lib/error-handling";
import { firestore } from "../lib/firebase-admin";
import { logger } from "../lib/logger";

// Set up logger for client-side logs
export { logger };

/**
 * Sets up the logs router for logging-related endpoints
 */
export function setupLogsRouter() {
  const router = express.Router();

  /**
   * Endpoint to log client-side errors
   * Accessible without authentication for error reporting
   */
  router.post("/api/logs/error", async (req, res) => {
    try {
      const {
        message,
        stack,
        url,
        line,
        column,
        userAgent,
        timestamp = new Date().toISOString(),
        userId,
        level = "error",
        context = {},
      } = req.body;

      // Basic validation
      if (!message) {
        return res.status(400).json({
          error: "Error message is required",
          code: "validation/missing-message",
          statusCode: 400,
        });
      }

      // Create log entry
      const logEntry = {
        message,
        stack,
        url,
        line,
        column,
        userAgent,
        timestamp,
        userId,
        level,
        context,
        ip: req.ip,
      };

      // Log to server logs
      logger.error("Client error:", logEntry);

      // Store in Firestore if appropriate
      if (process.env.STORE_CLIENT_LOGS === "true") {
        await firestore.collection("clientLogs").add(logEntry);
      }

      res.status(201).json({ success: true });
    } catch (error) {
      logger.error("Failed to log client error", { error });
      // Don't use handleError to avoid circular error logging
      res.status(500).json({
        error: "Failed to log error",
        code: "logs/internal-error",
        statusCode: 500,
      });
    }
  });

  /**
   * Endpoint to retrieve logs
   * Admin access only
   */
  router.get("/api/logs", checkAuthenticated, checkAdmin, async (req, res) => {
    try {
      const { limit = "50", startAfter, level } = req.query;

      let query = firestore
        .collection("clientLogs")
        .orderBy("timestamp", "desc")
        .limit(parseInt(limit as string, 10) || 50);

      // Filter by level if provided
      if (level) {
        query = query.where("level", "==", level);
      }

      // Pagination using startAfter
      if (startAfter) {
        const startAfterDoc = await firestore
          .collection("clientLogs")
          .doc(startAfter as string)
          .get();

        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const logsSnapshot = await query.get();

      const logs = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ logs });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to clear logs
   * Admin access only
   */
  router.delete(
    "/api/logs",
    checkAuthenticated,
    checkAdmin,
    async (req, res) => {
      try {
        const { olderThan, level } = req.query;

        // Avoid accidental deletion of all logs
        if (!olderThan && !level) {
          return res.status(400).json({
            error: "At least one filter (olderThan or level) is required",
            code: "validation/missing-filter",
            statusCode: 400,
          });
        }

        let query = firestore.collection("clientLogs");

        // Filter by level
        if (level) {
          query = query.where("level", "==", level);
        }

        // Filter by date
        if (olderThan) {
          const olderThanDate = new Date(olderThan as string);
          query = query.where("timestamp", "<", olderThanDate.toISOString());
        }

        // Get documents to delete
        const logsSnapshot = await query.get();

        // Batch delete (Firestore allows max 500 per batch)
        const batches = [];
        const batchSize = 500;
        let batch = firestore.batch();
        let operationCounter = 0;

        logsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          operationCounter++;

          if (operationCounter === batchSize) {
            batches.push(batch.commit());
            batch = firestore.batch();
            operationCounter = 0;
          }
        });

        // Commit any remaining operations
        if (operationCounter > 0) {
          batches.push(batch.commit());
        }

        await Promise.all(batches);

        logger.info(`Deleted ${logsSnapshot.size} logs`, {
          adminId: req.user!.uid,
          filters: { olderThan, level },
        });

        res.json({
          success: true,
          message: `Successfully deleted ${logsSnapshot.size} logs`,
        });
      } catch (error) {
        const errorResponse = handleError(error);
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  );

  return router;
}
