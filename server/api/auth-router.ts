import express from "express";
import { checkAuthenticated, checkAdmin } from "../middlewares/auth-middleware";
import { auth, getUserByUid, setCustomUserClaims } from "../lib/firebase-admin";
import { handleError, AppError } from "../lib/error-handling";
import { logger } from "../lib/logger";

/**
 * Sets up the authentication router with auth-related endpoints
 */
export function setupAuthRouter() {
  const router = express.Router();

  /**
   * Endpoint to get the current user's profile
   * Requires authentication
   */
  router.get("/api/auth/me", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;

      // Get full user details from Firebase
      const userRecord = await getUserByUid(uid);

      // Return sanitized user data
      res.json({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        isAdmin: req.user!.admin || false,
      });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to get a list of users
   * Admin access only
   */
  router.get(
    "/api/auth/users",
    checkAuthenticated,
    checkAdmin,
    async (req, res) => {
      try {
        const { pageSize = "10", pageToken } = req.query;

        // List users with pagination
        const result = await auth.listUsers(
          parseInt(pageSize as string, 10) || 10,
          pageToken as string,
        );

        // Return sanitized user list
        res.json({
          users: result.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            disabled: user.disabled,
          })),
          pageToken: result.pageToken,
        });
      } catch (error) {
        const errorResponse = handleError(error);
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  );

  /**
   * Endpoint to set a user as admin
   * Admin access only
   */
  router.post(
    "/api/auth/setAdmin",
    checkAuthenticated,
    checkAdmin,
    async (req, res) => {
      try {
        const { uid, isAdmin } = req.body;

        if (!uid) {
          throw new AppError("User ID is required", "validation/missing-uid");
        }

        if (typeof isAdmin !== "boolean") {
          throw new AppError(
            "isAdmin must be a boolean",
            "validation/invalid-type",
          );
        }

        // Set admin claim
        await setCustomUserClaims(uid, { admin: isAdmin });

        res.json({
          success: true,
          message: `User ${uid} admin status set to ${isAdmin}`,
        });
      } catch (error) {
        const errorResponse = handleError(error);
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  );

  /**
   * Endpoint to disable a user account
   * Admin access only
   */
  router.post(
    "/api/auth/disableUser",
    checkAuthenticated,
    checkAdmin,
    async (req, res) => {
      try {
        const { uid, disabled } = req.body;

        if (!uid) {
          throw new AppError("User ID is required", "validation/missing-uid");
        }

        if (typeof disabled !== "boolean") {
          throw new AppError(
            "disabled must be a boolean",
            "validation/invalid-type",
          );
        }

        // Update user
        if (disabled) {
          await auth.updateUser(uid, { disabled: true });
        } else {
          await auth.updateUser(uid, { disabled: false });
        }

        logger.info(`User ${uid} disabled status set to ${disabled}`, {
          adminId: req.user!.uid,
        });

        res.json({
          success: true,
          message: `User ${uid} disabled status set to ${disabled}`,
        });
      } catch (error) {
        const errorResponse = handleError(error);
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  );

  return router;
}
