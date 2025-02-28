import {
  useQuery,
  UseQueryOptions,
  useQueryClient,
  useMutation as useReactQueryMutation,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useMutation, MutationOptions } from "./use-mutation";

// Type for the create operation
export interface CreateHookOptions<TData, TVariables> {
  /**
   * The mutation function for creating a record
   */
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>;
  
  /**
   * Additional options for React Query
   */
  options?: MutationOptions<TData, Error, TVariables, unknown>;
  
  /**
   * Query key for invalidation after mutation
   */
  invalidateQueryKey?: unknown[];
}

// Type for the update operation
export interface UpdateHookOptions<TData, TVariables> {
  /**
   * The mutation function for updating a record
   */
  mutationFn: (id: string, variables: TVariables) => Promise<{ data: TData }>;
  
  /**
   * Additional options for React Query
   */
  options?: MutationOptions<TData, Error, { id: string; data: TVariables }, unknown>;
  
  /**
   * Query key for invalidation after mutation
   */
  invalidateQueryKey?: unknown[];
}

// Type for the delete operation
export interface DeleteHookOptions {
  /**
   * The mutation function for deleting a record
   */
  mutationFn: (id: string) => Promise<{ data: { success: boolean } }>;
  
  /**
   * Additional options for React Query
   */
  options?: MutationOptions<{ success: boolean }, Error, string, unknown>;
  
  /**
   * Query key for invalidation after mutation
   */
  invalidateQueryKey?: unknown[];
}

// Type for the get operation
export interface GetHookOptions<TData, TQueryKey extends unknown[]> {
  /**
   * The query function for fetching a record
   */
  queryFn: (id: string) => Promise<{ data: TData }>;
  
  /**
   * Function to generate the query key
   */
  getQueryKey: (id: string) => TQueryKey;
}

// Type for the get all operation
export interface GetAllHookOptions<TData, TQueryParams, TQueryKey extends unknown[]> {
  /**
   * The query function for fetching all records
   */
  queryFn: (params?: TQueryParams) => Promise<{ data: TData }>;
  
  /**
   * Function to generate the query key
   */
  getQueryKey: (params?: TQueryParams) => TQueryKey;
}

/**
 * A factory function that creates a set of hooks for a specific entity
 */
export function createQueryHooks<
  TEntity,
  TEntities,
  TCreateInput,
  TUpdateInput,
  TQueryParams = {}
>(config: {
  entityName: string;
  getAll: GetAllHookOptions<TEntities, TQueryParams, [string, TQueryParams?]>;
  getById: GetHookOptions<TEntity, [string, string]>;
  create?: CreateHookOptions<TEntity, TCreateInput>;
  update?: UpdateHookOptions<TEntity, TUpdateInput>;
  delete?: DeleteHookOptions;
}) {
  const {
    entityName,
    getAll,
    getById,
    create,
    update,
    delete: deleteConfig,
  } = config;

  // Hook for getting all entities
  function useGetAll(
    params?: TQueryParams,
    options?: UseQueryOptions<TEntities, Error, TEntities, [string, TQueryParams?]>
  ) {
    return useQuery({
      queryKey: getAll.getQueryKey(params),
      queryFn: () => getAll.queryFn(params).then((res) => res.data),
      ...options,
    });
  }

  // Hook for getting a single entity by ID
  function useGetById(
    id: string,
    options?: UseQueryOptions<TEntity, Error, TEntity, [string, string]>
  ) {
    return useQuery({
      queryKey: getById.getQueryKey(id),
      queryFn: () => getById.queryFn(id).then((res) => res.data),
      enabled: !!id && (options?.enabled !== false),
      ...options,
    });
  }

  // Hook for creating a new entity
  function useCreate() {
    const queryClient = useQueryClient();

    if (!create) {
      throw new Error(`Create operation not defined for ${entityName}`);
    }

    return useMutation({
      mutationFn: (variables: TCreateInput) => 
        create.mutationFn(variables).then((res) => res.data),
      toast: {
        success: { 
          title: "Created Successfully", 
          description: `${entityName} has been created successfully` 
        },
        error: { 
          title: "Creation Failed", 
          description: `Failed to create ${entityName}` 
        },
      },
      options: {
        ...create.options?.options,
        onSuccess: (data, variables, context) => {
          // Invalidate relevant queries
          if (create.invalidateQueryKey) {
            queryClient.invalidateQueries({ queryKey: create.invalidateQueryKey });
          }
          
          if (create.options?.options?.onSuccess) {
            create.options.options.onSuccess(data, variables, context);
          }
        },
      },
    });
  }

  // Hook for updating an entity
  function useUpdate() {
    const queryClient = useQueryClient();

    if (!update) {
      throw new Error(`Update operation not defined for ${entityName}`);
    }

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdateInput }) => 
        update.mutationFn(id, data).then((res) => res.data),
      toast: {
        success: { 
          title: "Updated Successfully", 
          description: `${entityName} has been updated successfully` 
        },
        error: { 
          title: "Update Failed", 
          description: `Failed to update ${entityName}` 
        },
      },
      options: {
        ...update.options?.options,
        onSuccess: (data, variables, context) => {
          // Invalidate relevant queries
          if (update.invalidateQueryKey) {
            queryClient.invalidateQueries({ queryKey: update.invalidateQueryKey });
          }
          
          // Also invalidate the specific entity
          queryClient.invalidateQueries({ 
            queryKey: getById.getQueryKey(variables.id) 
          });
          
          if (update.options?.options?.onSuccess) {
            update.options.options.onSuccess(data, variables, context);
          }
        },
      },
    });
  }

  // Hook for deleting an entity
  function useDelete() {
    const queryClient = useQueryClient();

    if (!deleteConfig) {
      throw new Error(`Delete operation not defined for ${entityName}`);
    }

    return useMutation({
      mutationFn: (id: string) => 
        deleteConfig.mutationFn(id).then((res) => res.data),
      toast: {
        success: { 
          title: "Deleted Successfully", 
          description: `${entityName} has been deleted successfully` 
        },
        error: { 
          title: "Deletion Failed", 
          description: `Failed to delete ${entityName}` 
        },
      },
      options: {
        ...deleteConfig.options?.options,
        onSuccess: (data, variables, context) => {
          // Invalidate relevant queries
          if (deleteConfig.invalidateQueryKey) {
            queryClient.invalidateQueries({ queryKey: deleteConfig.invalidateQueryKey });
          }
          
          if (deleteConfig.options?.options?.onSuccess) {
            deleteConfig.options.options.onSuccess(data, variables, context);
          }
        },
      },
    });
  }

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
  };
}

// Example usage for creating agent hooks
export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (params?: any) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

export const useAgents = createQueryHooks({
  entityName: "Agent",
  getAll: {
    queryFn: apiClient.agents.getAll,
    getQueryKey: (params) => agentKeys.list(params),
  },
  getById: {
    queryFn: apiClient.agents.getById,
    getQueryKey: (id) => agentKeys.detail(id),
  },
  create: {
    mutationFn: apiClient.agents.create,
    invalidateQueryKey: agentKeys.lists(),
  },
  update: {
    mutationFn: apiClient.agents.update,
    invalidateQueryKey: agentKeys.lists(),
  },
  delete: {
    mutationFn: apiClient.agents.delete,
    invalidateQueryKey: agentKeys.lists(),
  },
});

// Example usage for creating prompt hooks
export const promptKeys = {
  all: ["prompts"] as const,
  lists: () => [...promptKeys.all, "list"] as const,
  list: (params?: any) => [...promptKeys.lists(), params] as const,
  details: () => [...promptKeys.all, "detail"] as const,
  detail: (id: string) => [...promptKeys.details(), id] as const,
};

export const usePrompts = createQueryHooks({
  entityName: "Prompt",
  getAll: {
    queryFn: apiClient.prompts.getAll,
    getQueryKey: (params) => promptKeys.list(params),
  },
  getById: {
    queryFn: apiClient.prompts.getById,
    getQueryKey: (id) => promptKeys.detail(id),
  },
  create: {
    mutationFn: apiClient.prompts.create,
    invalidateQueryKey: promptKeys.lists(),
  },
  update: {
    mutationFn: apiClient.prompts.update,
    invalidateQueryKey: promptKeys.lists(),
  },
  delete: {
    mutationFn: apiClient.prompts.delete,
    invalidateQueryKey: promptKeys.lists(),
  },
}); 