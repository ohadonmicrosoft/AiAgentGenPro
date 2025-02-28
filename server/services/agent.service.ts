import { firestore } from '../lib/firebase-admin';
import { Agent, CreateAgentInput, UpdateAgentInput, defaultAgentSettings } from '../models/agent.model';
import { AppError, NotFoundError, ForbiddenError } from '../lib/error-handling';

/**
 * Collection reference for agents
 */
const agentsCollection = 'agents';

/**
 * Service for managing agent data
 */
export class AgentService {
  /**
   * Get an agent by ID
   */
  async getAgentById(id: string): Promise<Agent> {
    const agentDoc = await firestore.collection(agentsCollection).doc(id).get();
    
    if (!agentDoc.exists) {
      throw new NotFoundError(`Agent with ID ${id} not found`);
    }
    
    return {
      id: agentDoc.id,
      ...agentDoc.data(),
    } as Agent;
  }

  /**
   * Verify agent ownership or throw error
   */
  async verifyAgentOwnership(agentId: string, userId: string): Promise<void> {
    const agent = await this.getAgentById(agentId);
    
    if (agent.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this agent');
    }
  }
  
  /**
   * Get all agents for a user
   */
  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    const agentsSnapshot = await firestore
      .collection(agentsCollection)
      .where('ownerId', '==', userId)
      .get();
    
    return agentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Agent));
  }
  
  /**
   * Create a new agent
   */
  async createAgent(agentData: CreateAgentInput, userId: string): Promise<Agent> {
    // Set defaults and required fields
    const newAgent = {
      ...agentData,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ...defaultAgentSettings,
        ...agentData.settings,
      },
    };
    
    // Create the agent in Firestore
    const docRef = await firestore.collection(agentsCollection).add(newAgent);
    
    // Return the created agent with ID
    return {
      id: docRef.id,
      ...newAgent,
    } as Agent;
  }
  
  /**
   * Update an existing agent
   */
  async updateAgent(id: string, updateData: UpdateAgentInput, userId: string): Promise<Agent> {
    // Verify ownership
    await this.verifyAgentOwnership(id, userId);
    
    // Prevent overriding critical fields
    delete (updateData as any).id;
    delete (updateData as any).ownerId;
    delete (updateData as any).createdAt;
    
    // Add update timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      // Merge settings if provided
      ...(updateData.settings && {
        settings: {
          ...defaultAgentSettings,
          ...updateData.settings,
        },
      }),
    };
    
    // Update agent
    await firestore
      .collection(agentsCollection)
      .doc(id)
      .update(dataToUpdate);
    
    // Return the updated agent
    return this.getAgentById(id);
  }
  
  /**
   * Delete an agent
   */
  async deleteAgent(id: string, userId: string): Promise<void> {
    // Verify ownership
    await this.verifyAgentOwnership(id, userId);
    
    // Delete agent
    await firestore.collection(agentsCollection).doc(id).delete();
  }
  
  /**
   * Get public agents
   */
  async getPublicAgents(limit: number = 10, offset: number = 0): Promise<Agent[]> {
    const agentsSnapshot = await firestore
      .collection(agentsCollection)
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    return agentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Agent));
  }
} 