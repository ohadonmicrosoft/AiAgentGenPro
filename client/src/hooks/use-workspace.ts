import { useCallback } from "react";
import { useGlobalState } from "../contexts/global-state-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../lib/error-handling";

/**
 * Error class for workspace-related errors
 */
export class WorkspaceError extends AppError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = "WorkspaceError";
  }
}

/**
 * Workspace interface
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: WorkspaceMember[];
  isDefault?: boolean;
}

/**
 * Workspace member interface
 */
export interface WorkspaceMember {
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
}

/**
 * Interface for creating a new workspace
 */
export interface NewWorkspaceInput {
  name: string;
  description?: string;
}

/**
 * API functions
 */

/**
 * Fetches all workspaces for the current user
 */
async function fetchWorkspaces(): Promise<Workspace[]> {
  try {
    const response = await fetch("/api/workspaces");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WorkspaceError(
        errorData.message || `Failed to fetch workspaces: ${response.status}`,
        `FETCH_WORKSPACES_${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof WorkspaceError) {
      throw error;
    }

    throw new WorkspaceError(
      error instanceof Error ? error.message : "Failed to fetch workspaces",
      "FETCH_WORKSPACES_ERROR",
    );
  }
}

/**
 * Fetches a single workspace by ID
 */
async function fetchWorkspaceById(id: string): Promise<Workspace> {
  try {
    const response = await fetch(`/api/workspaces/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WorkspaceError(
        errorData.message || `Failed to fetch workspace: ${response.status}`,
        `FETCH_WORKSPACE_${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof WorkspaceError) {
      throw error;
    }

    throw new WorkspaceError(
      error instanceof Error ? error.message : "Failed to fetch workspace",
      "FETCH_WORKSPACE_ERROR",
    );
  }
}

/**
 * Creates a new workspace
 */
async function createWorkspace(data: NewWorkspaceInput): Promise<Workspace> {
  try {
    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WorkspaceError(
        errorData.message || `Failed to create workspace: ${response.status}`,
        `CREATE_WORKSPACE_${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof WorkspaceError) {
      throw error;
    }

    throw new WorkspaceError(
      error instanceof Error ? error.message : "Failed to create workspace",
      "CREATE_WORKSPACE_ERROR",
    );
  }
}

/**
 * Updates an existing workspace
 */
async function updateWorkspace(
  id: string,
  data: Partial<Workspace>,
): Promise<Workspace> {
  try {
    const response = await fetch(`/api/workspaces/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WorkspaceError(
        errorData.message || `Failed to update workspace: ${response.status}`,
        `UPDATE_WORKSPACE_${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof WorkspaceError) {
      throw error;
    }

    throw new WorkspaceError(
      error instanceof Error ? error.message : "Failed to update workspace",
      "UPDATE_WORKSPACE_ERROR",
    );
  }
}

/**
 * Deletes a workspace
 */
async function deleteWorkspace(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/workspaces/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WorkspaceError(
        errorData.message || `Failed to delete workspace: ${response.status}`,
        `DELETE_WORKSPACE_${response.status}`,
      );
    }
  } catch (error) {
    if (error instanceof WorkspaceError) {
      throw error;
    }

    throw new WorkspaceError(
      error instanceof Error ? error.message : "Failed to delete workspace",
      "DELETE_WORKSPACE_ERROR",
    );
  }
}

/**
 * Hook for workspace management that integrates with global state
 *
 * @returns The workspace management utilities
 *
 * @example
 * ```tsx
 * const {
 *   currentWorkspaceId,
 *   workspaces,
 *   currentWorkspace,
 *   setCurrentWorkspace,
 *   createWorkspaceMutation
 * } = useWorkspace();
 *
 * // Switch workspace
 * const handleSwitchWorkspace = (id) => {
 *   setCurrentWorkspace(id);
 * };
 *
 * // Create a new workspace
 * const handleCreateWorkspace = (data) => {
 *   createWorkspaceMutation.mutate(data, {
 *     onSuccess: (newWorkspace) => {
 *       setCurrentWorkspace(newWorkspace.id);
 *     }
 *   });
 * };
 * ```
 */
export function useWorkspace() {
  const queryClient = useQueryClient();
  const {
    state,
    setCurrentWorkspace: setGlobalWorkspace,
    addNotification,
  } = useGlobalState();

  // Get the current workspace ID from global state
  const currentWorkspaceId = state.currentWorkspaceId;

  // Query to fetch all workspaces
  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });

  // Query to fetch the current workspace
  const currentWorkspaceQuery = useQuery({
    queryKey: ["workspace", currentWorkspaceId],
    queryFn: () => fetchWorkspaceById(currentWorkspaceId as string),
    enabled: !!currentWorkspaceId,
  });

  // Function to set the current workspace
  const setCurrentWorkspace = useCallback(
    (workspaceId: string | null) => {
      setGlobalWorkspace(workspaceId);

      if (workspaceId) {
        // Prefetch the workspace data to ensure it's available
        queryClient.prefetchQuery({
          queryKey: ["workspace", workspaceId],
          queryFn: () => fetchWorkspaceById(workspaceId),
        });
      }
    },
    [setGlobalWorkspace, queryClient],
  );

  // Mutation to create a new workspace
  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      addNotification({
        type: "success",
        title: "Workspace Created",
        message: `Workspace "${newWorkspace.name}" has been created.`,
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Error Creating Workspace",
        message:
          error instanceof Error ? error.message : "Failed to create workspace",
      });
    },
  });

  // Mutation to update a workspace
  const updateWorkspaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workspace> }) =>
      updateWorkspace(id, data),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", updatedWorkspace.id],
      });
      addNotification({
        type: "success",
        title: "Workspace Updated",
        message: `Workspace "${updatedWorkspace.name}" has been updated.`,
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Error Updating Workspace",
        message:
          error instanceof Error ? error.message : "Failed to update workspace",
      });
    },
  });

  // Mutation to delete a workspace
  const deleteWorkspaceMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({ queryKey: ["workspace", id] });

      // If the deleted workspace is the current one, select another workspace
      if (currentWorkspaceId === id) {
        // Find another workspace to select
        workspacesQuery.data?.forEach((workspace) => {
          if (workspace.id !== id) {
            setCurrentWorkspace(workspace.id);
            return false; // Break the loop
          }
        });

        // If no other workspace is found, clear the selection
        if (currentWorkspaceId === id) {
          setCurrentWorkspace(null);
        }
      }

      addNotification({
        type: "success",
        title: "Workspace Deleted",
        message: "The workspace has been deleted.",
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Error Deleting Workspace",
        message:
          error instanceof Error ? error.message : "Failed to delete workspace",
      });
    },
  });

  return {
    // State
    currentWorkspaceId,
    workspaces: workspacesQuery.data || [],
    currentWorkspace: currentWorkspaceQuery.data,
    isLoading:
      workspacesQuery.isLoading ||
      (currentWorkspaceId ? currentWorkspaceQuery.isLoading : false),
    isError:
      workspacesQuery.isError ||
      (currentWorkspaceId ? currentWorkspaceQuery.isError : false),

    // Queries
    workspacesQuery,
    currentWorkspaceQuery,

    // Actions
    setCurrentWorkspace,

    // Mutations
    createWorkspaceMutation,
    updateWorkspaceMutation,
    deleteWorkspaceMutation,
  };
}
