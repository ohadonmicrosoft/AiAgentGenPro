import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";

// Initialize Firebase Admin
admin.initializeApp();
dotenv.config();

// Initialize Firestore database
const db = admin.firestore();

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));

// User API endpoints
app.get("/api/user/:uid", async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.params.uid);
    const userDoc = await db.collection("users").doc(req.params.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...userDoc.data(),
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Agents API endpoints
app.get("/api/agents", async (req, res) => {
  try {
    const uid = req.query.uid as string;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const agentsSnapshot = await db
      .collection("agents")
      .where("owner", "==", uid)
      .orderBy("updatedAt", "desc")
      .get();

    const agents = agentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/agents", async (req, res) => {
  try {
    const { name, description, owner, prompt, config } = req.body;

    if (!name || !owner) {
      return res.status(400).json({
        success: false,
        message: "Name and owner ID are required",
      });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const agentData = {
      name,
      description: description || "",
      owner,
      prompt: prompt || "",
      config: config || {},
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const agentRef = await db.collection("agents").add(agentData);

    return res.status(201).json({
      success: true,
      data: {
        id: agentRef.id,
        ...agentData,
      },
      message: "Agent created successfully",
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create agent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Prompts API endpoints
app.get("/api/prompts", async (req, res) => {
  try {
    const uid = req.query.uid as string;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const promptsSnapshot = await db
      .collection("prompts")
      .where("owner", "==", uid)
      .orderBy("updatedAt", "desc")
      .get();

    const prompts = promptsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prompts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Dashboard stats API endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const uid = req.query.uid as string;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get agents count
    const agentsSnapshot = await db
      .collection("agents")
      .where("owner", "==", uid)
      .get();

    // Get active agents count
    const activeAgentsSnapshot = await db
      .collection("agents")
      .where("owner", "==", uid)
      .where("status", "==", "active")
      .get();

    // Get prompts count
    const promptsSnapshot = await db
      .collection("prompts")
      .where("owner", "==", uid)
      .get();

    // Get interactions count (if we have an interactions collection)
    let interactionsCount = 0;
    try {
      const interactionsSnapshot = await db
        .collection("interactions")
        .where("owner", "==", uid)
        .get();
      interactionsCount = interactionsSnapshot.size;
    } catch (err) {
      console.log("Interactions collection might not exist yet");
    }

    return res.status(200).json({
      success: true,
      data: {
        totalAgents: agentsSnapshot.size,
        activeAgents: activeAgentsSnapshot.size,
        savedPrompts: promptsSnapshot.size,
        totalInteractions: interactionsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Export the Express API as a Firebase Function
export const api = functions.https.onRequest(app);

// User creation trigger to set up initial data
export const createUserProfile = functions.auth
  .user()
  .onCreate(async (user) => {
    try {
      const { uid, displayName, email, photoURL } = user;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Create user document in Firestore
      await db
        .collection("users")
        .doc(uid)
        .set({
          displayName: displayName || "",
          email: email || "",
          photoURL: photoURL || "",
          createdAt: timestamp,
          updatedAt: timestamp,
          role: "user",
          settings: {
            theme: "system",
            notifications: true,
          },
        });

      console.log(`User profile created for ${uid}`);
      return null;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  });
