import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "./logger";
import { appConfig } from "../config/app.config";
import { firebaseConfig } from "../config/firebase.config";
import { AppError } from "./error-handling";

// Check if the app is already initialized to prevent multiple initializations
let firebaseApp: admin.app.App;

try {
  // Try to get the default app (throws if not initialized)
  firebaseApp = admin.app();
  logger.debug("Firebase Admin SDK already initialized");
} catch (error) {
  // Initialize the app if it doesn't exist
  logger.info("Initializing Firebase Admin SDK");

  if (appConfig.useMockStorage) {
    // Use a local credential for development/testing
    logger.warn("Using mock Firebase credentials for development");

    firebaseApp = admin.initializeApp({
      projectId: "mock-project-id",
      // Optional emulator configuration
      ...(firebaseConfig.useEmulator && {
        databaseURL: `http://localhost:${firebaseConfig.emulatorPorts.firestore}?ns=mock-project-id`,
      }),
    });

    // Configure Firestore emulator if enabled
    if (firebaseConfig.useEmulator) {
      logger.info(
        `Using Firebase emulators: ${JSON.stringify(firebaseConfig.emulatorPorts)}`,
      );
      const db = getFirestore();
      db.settings({
        host: `localhost:${firebaseConfig.emulatorPorts.firestore}`,
        ssl: false,
      });
    }
  } else {
    // Use service account for production
    try {
      // First try to read from environment variables
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
          databaseURL: firebaseConfig.databaseURL,
          storageBucket: firebaseConfig.storageBucket,
        });
      }
      // Fall back to service account file
      else {
        const serviceAccountPath =
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          "./service-account.json";
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: firebaseConfig.databaseURL,
          storageBucket: firebaseConfig.storageBucket,
        });
        logger.info(
          `Using Firebase service account from: ${serviceAccountPath}`,
        );
      }
    } catch (initError) {
      logger.error("Failed to initialize Firebase Admin SDK", {
        error: (initError as Error).message,
        stack: (initError as Error).stack,
      });
      throw initError;
    }
  }
}

// Export the initialized services
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;

/**
 * Verifies a Firebase ID token
 *
 * @param idToken - The token to verify
 * @returns The decoded token
 * @throws An error if token verification fails
 */
export async function verifyIdToken(idToken: string) {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error: any) {
    logger.error("Token verification failed", {
      error: error.message,
      code: error.code,
    });

    throw new AppError(
      "Authentication failed: " + (error.message || "Invalid token"),
      error.code || "auth/invalid-token",
      401,
    );
  }
}

/**
 * Gets a user by their UID
 *
 * @param uid - The user's UID
 * @returns The user record
 * @throws An error if the user is not found
 */
export async function getUserByUid(uid: string) {
  try {
    return await auth.getUser(uid);
  } catch (error: any) {
    logger.error("Failed to get user by UID", {
      uid,
      error: error.message,
      code: error.code,
    });

    throw new AppError(
      "User not found",
      error.code || "auth/user-not-found",
      404,
    );
  }
}

/**
 * Sets custom claims for a user
 *
 * @param uid - The user's UID
 * @param claims - The custom claims to set
 */
export async function setCustomUserClaims(uid: string, claims: object) {
  try {
    await auth.setCustomUserClaims(uid, claims);
    logger.info("Custom claims set for user", { uid });
  } catch (error: any) {
    logger.error("Failed to set custom claims for user", {
      uid,
      error: error.message,
      code: error.code,
    });

    throw new AppError(
      "Failed to set custom claims: " + (error.message || "Unknown error"),
      error.code || "auth/custom-claims-error",
      500,
    );
  }
}
