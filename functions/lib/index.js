"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserProfile = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const expressModule = __importStar(require("express"));
const express = expressModule.default || expressModule;
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
// Initialize Firebase Admin
admin.initializeApp();
dotenv.config();
// Initialize Firestore database
const db = admin.firestore();
// Initialize Express app
const app = express();
app.use((0, cors_1.default)({ origin: true }));
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
    }
    catch (error) {
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
        const uid = req.query.uid;
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
    }
    catch (error) {
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
    }
    catch (error) {
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
        const uid = req.query.uid;
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
    }
    catch (error) {
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
        const uid = req.query.uid;
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
        }
        catch (err) {
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
    }
    catch (error) {
        console.error("Error fetching stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// Export the Express API as a Firebase Function
exports.api = functions
    .region('europe-west3') // Set region to Frankfurt, Germany (close to Israel)
    .https.onRequest(app);
// User creation trigger to set up initial data
exports.createUserProfile = functions
    .region('europe-west3') // Set region to Frankfurt, Germany (close to Israel)
    .auth
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
    }
    catch (error) {
        console.error("Error creating user profile:", error);
        return null;
    }
});
//# sourceMappingURL=index.js.map