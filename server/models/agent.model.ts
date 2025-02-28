import { z } from 'zod';

/**
 * Agent schema validation using Zod
 */
export const agentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  promptTemplate: z.string(),
  ownerId: z.string(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  inputVariables: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['text', 'number', 'boolean', 'select']),
    required: z.boolean().default(true),
    defaultValue: z.any().optional(),
    options: z.array(z.string()).optional(),
  })).default([]),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
  settings: z.object({
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().positive().default(2000),
    systemPrompt: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export type Agent = z.infer<typeof agentSchema>;

/**
 * Schema for creating a new agent
 */
export const createAgentSchema = agentSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

/**
 * Schema for updating an existing agent
 */
export const updateAgentSchema = createAgentSchema.partial();

export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

/**
 * Default agent settings
 */
export const defaultAgentSettings = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
}; 