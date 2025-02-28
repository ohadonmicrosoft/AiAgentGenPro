import express from "express";
import { checkAuthenticated } from "../middlewares/auth-middleware";
import { handleError } from "../lib/error-handling";
import { firestore } from "../lib/firebase-admin";
import { logger } from "../lib/logger";

/**
 * Sets up the main API router with all API endpoints
 */
export function setupApiRouter() {
  const router = express.Router();

  /**
   * Endpoint to get user profile data
   * Requires authentication
   */
  router.get("/api/user", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;

      // Get user profile from Firestore
      const userProfileDoc = await firestore
        .collection("userProfiles")
        .doc(uid)
        .get();

      if (!userProfileDoc.exists) {
        // Create a default profile if it doesn't exist
        const defaultProfile = {
          uid,
          createdAt: new Date().toISOString(),
          preferences: {
            theme: "system",
            language: "en",
            notifications: true,
          },
        };

        await firestore.collection("userProfiles").doc(uid).set(defaultProfile);

        return res.json(defaultProfile);
      }

      return res.json(userProfileDoc.data());
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to update user profile
   * Requires authentication
   */
  router.put("/api/user", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;
      const updateData = req.body;

      // Prevent overriding the user ID
      delete updateData.uid;

      // Add update timestamp
      updateData.updatedAt = new Date().toISOString();

      // Update user profile
      await firestore.collection("userProfiles").doc(uid).update(updateData);

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to get agents
   * Requires authentication
   */
  router.get("/api/agents", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;

      // Get user's agents from Firestore
      const agentsSnapshot = await firestore
        .collection("agents")
        .where("ownerId", "==", uid)
        .get();

      const agents = agentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ agents });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to get a specific agent
   * Requires authentication
   */
  router.get("/api/agents/:id", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;
      const { id } = req.params;

      // Get the agent from Firestore
      const agentDoc = await firestore.collection("agents").doc(id).get();

      if (!agentDoc.exists) {
        return res.status(404).json({
          error: "Agent not found",
          code: "entity/not-found",
          statusCode: 404,
        });
      }

      const agent = agentDoc.data();

      // Check if user has access to this agent
      if (agent?.ownerId !== uid) {
        return res.status(403).json({
          error: "You do not have access to this agent",
          code: "auth/forbidden",
          statusCode: 403,
        });
      }

      res.json({
        id: agentDoc.id,
        ...agent,
      });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to create a new agent
   * Requires authentication
   */
  router.post("/api/agents", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;
      const agentData = req.body;

      // Validate required fields
      if (!agentData.name) {
        return res.status(400).json({
          error: "Agent name is required",
          code: "validation/missing-name",
          statusCode: 400,
        });
      }

      // Set owner and timestamps
      const newAgent = {
        ...agentData,
        ownerId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the agent in Firestore
      const agentRef = await firestore.collection("agents").add(newAgent);

      logger.info("New agent created", {
        agentId: agentRef.id,
        userId: uid,
      });

      res.status(201).json({
        id: agentRef.id,
        ...newAgent,
      });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to update an agent
   * Requires authentication
   */
  router.put("/api/agents/:id", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;
      const { id } = req.params;
      const updateData = req.body;

      // Get the agent to check ownership
      const agentDoc = await firestore.collection("agents").doc(id).get();

      if (!agentDoc.exists) {
        return res.status(404).json({
          error: "Agent not found",
          code: "entity/not-found",
          statusCode: 404,
        });
      }

      const agent = agentDoc.data();

      // Check if user has access to this agent
      if (agent?.ownerId !== uid) {
        return res.status(403).json({
          error: "You do not have permission to update this agent",
          code: "auth/forbidden",
          statusCode: 403,
        });
      }

      // Prevent changing the owner
      delete updateData.ownerId;
      delete updateData.createdAt;

      // Add update timestamp
      updateData.updatedAt = new Date().toISOString();

      // Update the agent
      await firestore.collection("agents").doc(id).update(updateData);

      res.json({
        id,
        ...agent,
        ...updateData,
      });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  /**
   * Endpoint to delete an agent
   * Requires authentication
   */
  router.delete("/api/agents/:id", checkAuthenticated, async (req, res) => {
    try {
      const { uid } = req.user!;
      const { id } = req.params;

      // Get the agent to check ownership
      const agentDoc = await firestore.collection("agents").doc(id).get();

      if (!agentDoc.exists) {
        return res.status(404).json({
          error: "Agent not found",
          code: "entity/not-found",
          statusCode: 404,
        });
      }

      const agent = agentDoc.data();

      // Check if user has access to this agent
      if (agent?.ownerId !== uid) {
        return res.status(403).json({
          error: "You do not have permission to delete this agent",
          code: "auth/forbidden",
          statusCode: 403,
        });
      }

      // Delete the agent
      await firestore.collection("agents").doc(id).delete();

      logger.info("Agent deleted", {
        agentId: id,
        userId: uid,
      });

      res.json({ success: true, message: "Agent deleted successfully" });
    } catch (error) {
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  });

  return router;
}
