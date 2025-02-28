import { Router } from "express";
import { z } from "zod";
import { AgentService } from "../services/agent.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateAgentInput, UpdateAgentInput } from "../models/agent.model";

const router = Router();
const agentService = new AgentService();

/**
 * @route GET /api/agents
 * @desc Get all agents for the authenticated user
 * @access Private
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.uid;
    const agents = await agentService.getAgentsByUserId(userId);

    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/agents/public
 * @desc Get public agents
 * @access Public
 */
router.get("/public", async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const agents = await agentService.getPublicAgents(limit, offset);

    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/agents/:id
 * @desc Get an agent by ID
 * @access Private if agent is not public
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await agentService.getAgentById(id);

    // Check if the agent is private and if so, verify ownership
    if (!agent.isPublic) {
      // If not authenticated, deny access
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required to access this agent",
        });
      }

      // If authenticated but not the owner, deny access
      if (agent.ownerId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to this agent",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/agents
 * @desc Create a new agent
 * @access Private
 */
router.post(
  "/",
  authMiddleware,
  validateRequest(CreateAgentInput),
  async (req, res, next) => {
    try {
      const userId = req.user!.uid;
      const agentData = req.body;

      const newAgent = await agentService.createAgent(agentData, userId);

      res.status(201).json({
        success: true,
        data: newAgent,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route PUT /api/agents/:id
 * @desc Update an agent
 * @access Private
 */
router.put(
  "/:id",
  authMiddleware,
  validateRequest(UpdateAgentInput),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.uid;
      const updateData = req.body;

      const updatedAgent = await agentService.updateAgent(
        id,
        updateData,
        userId,
      );

      res.status(200).json({
        success: true,
        data: updatedAgent,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route DELETE /api/agents/:id
 * @desc Delete an agent
 * @access Private
 */
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    await agentService.deleteAgent(id, userId);

    res.status(200).json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
