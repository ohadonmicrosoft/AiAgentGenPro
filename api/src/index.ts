/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const api = onRequest((request, response) => {
  logger.info("API request received", {
    path: request.path,
    method: request.method,
    query: request.query,
  });

  response.json({
    status: "success",
    message: "API is running",
    path: request.path,
    timestamp: new Date().toISOString(),
  });
});
