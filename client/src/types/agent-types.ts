/**
 * Agent interface representing an AI agent
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  isPublic: boolean;
  modelId: string;
  tags: string[];
  usageCount: number;
  averageRating?: number;
  capabilities?: AgentCapability[];
}

/**
 * Interface for creating a new agent
 */
export interface NewAgentInput {
  name: string;
  description?: string;
  systemPrompt?: string;
  isPublic?: boolean;
  modelId: string;
  tags?: string[];
  capabilities?: AgentCapability[];
}

/**
 * Represents a specific capability of an agent
 */
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

/**
 * Interface for agent run configuration
 */
export interface AgentRunConfig {
  agentId: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPromptOverride?: string;
  additionalInstructions?: string;
}

/**
 * Interface for agent run history
 */
export interface AgentRunHistory {
  id: string;
  agentId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  status: AgentRunStatus;
  messages: AgentMessage[];
  config: AgentRunConfig;
  rating?: number;
  feedback?: string;
}

/**
 * Status of an agent run
 */
export enum AgentRunStatus {
  QUEUED = "queued",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Message exchanged with an agent
 */
export interface AgentMessage {
  id: string;
  runId: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Agent statistics
 */
export interface AgentStats {
  totalRuns: number;
  averageRunDuration: number;
  averageRating: number;
  messageCount: number;
  popularTags: Array<{ tag: string; count: number }>;
  usageByDay: Array<{ date: string; count: number }>;
}

/**
 * Agent search parameters
 */
export interface AgentSearchParams {
  query?: string;
  tags?: string[];
  ownerId?: string;
  publicOnly?: boolean;
  sort?: "name" | "createdAt" | "usageCount" | "rating";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
