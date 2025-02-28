import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '../lib/error-handling';
import type { Agent, NewAgentInput } from '../types/agent-types';

/**
 * Error class for agent-related errors
 */
export class AgentError extends AppError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'AgentError';
  }
}

// API functions
/**
 * Fetches all agents
 */
async function fetchAgents(): Promise<Agent[]> {
  try {
    const response = await fetch('/api/agents');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AgentError(
        errorData.message || `Failed to fetch agents: ${response.status}`,
        `FETCH_AGENTS_${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    
    throw new AgentError(
      error instanceof Error ? error.message : 'Failed to fetch agents',
      'FETCH_AGENTS_ERROR'
    );
  }
}

/**
 * Fetches a single agent by ID
 */
async function fetchAgentById(id: string): Promise<Agent> {
  try {
    const response = await fetch(`/api/agents/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AgentError(
        errorData.message || `Failed to fetch agent: ${response.status}`,
        `FETCH_AGENT_${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    
    throw new AgentError(
      error instanceof Error ? error.message : 'Failed to fetch agent',
      'FETCH_AGENT_ERROR'
    );
  }
}

/**
 * Creates a new agent
 */
async function createAgent(data: NewAgentInput): Promise<Agent> {
  try {
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AgentError(
        errorData.message || `Failed to create agent: ${response.status}`,
        `CREATE_AGENT_${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    
    throw new AgentError(
      error instanceof Error ? error.message : 'Failed to create agent',
      'CREATE_AGENT_ERROR'
    );
  }
}

/**
 * Updates an existing agent
 */
async function updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
  try {
    const response = await fetch(`/api/agents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AgentError(
        errorData.message || `Failed to update agent: ${response.status}`,
        `UPDATE_AGENT_${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    
    throw new AgentError(
      error instanceof Error ? error.message : 'Failed to update agent',
      'UPDATE_AGENT_ERROR'
    );
  }
}

/**
 * Deletes an agent
 */
async function deleteAgent(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/agents/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AgentError(
        errorData.message || `Failed to delete agent: ${response.status}`,
        `DELETE_AGENT_${response.status}`
      );
    }
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    
    throw new AgentError(
      error instanceof Error ? error.message : 'Failed to delete agent',
      'DELETE_AGENT_ERROR'
    );
  }
}

// React Query hooks

/**
 * Hook to fetch all agents
 * 
 * @returns The agents query result
 * 
 * @example
 * ```tsx
 * const { data: agents, isLoading, error } = useAgents();
 * ```
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });
}

/**
 * Hook to fetch a single agent by ID
 * 
 * @param id - The agent ID
 * @returns The agent query result
 * 
 * @example
 * ```tsx
 * const { data: agent, isLoading, error } = useAgent('agent-123');
 * ```
 */
export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgentById(id),
    enabled: !!id, // Only run the query if we have an ID
  });
}

/**
 * Hook to create a new agent
 * 
 * @returns The create agent mutation
 * 
 * @example
 * ```tsx
 * const createAgentMutation = useCreateAgent();
 * 
 * function handleSubmit(data) {
 *   createAgentMutation.mutate(data, {
 *     onSuccess: (agent) => {
 *       console.log('Agent created:', agent);
 *     }
 *   });
 * }
 * ```
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      // Invalidate the agents list query to refetch
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

/**
 * Hook to update an agent
 * 
 * @returns The update agent mutation
 * 
 * @example
 * ```tsx
 * const updateAgentMutation = useUpdateAgent();
 * 
 * function handleUpdate(id, data) {
 *   updateAgentMutation.mutate({ id, data });
 * }
 * ```
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) => 
      updateAgent(id, data),
    onSuccess: (updatedAgent) => {
      // Update both the list and the individual agent query
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', updatedAgent.id] });
    },
  });
}

/**
 * Hook to delete an agent
 * 
 * @returns The delete agent mutation
 * 
 * @example
 * ```tsx
 * const deleteAgentMutation = useDeleteAgent();
 * 
 * function handleDelete(id) {
 *   deleteAgentMutation.mutate(id);
 * }
 * ```
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: (_, id) => {
      // Invalidate the agents list and remove the individual agent from the cache
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.removeQueries({ queryKey: ['agent', id] });
    },
  });
} 