import { QueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

// Error types
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error occurred. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication required", data?: any) {
    super(401, message, data);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "You don't have permission to access this resource", data?: any) {
    super(403, message, data);
    this.name = "AuthorizationError";
  }
}

// Response type
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create a singleton QueryClient to be used across the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Generic function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch (e) {
    errorData = { message: "An unexpected error occurred" };
  }

  const message = errorData.message || "An error occurred";

  // Create appropriate error based on status code
  switch (response.status) {
    case 401:
      throw new AuthenticationError(message, errorData);
    case 403:
      throw new AuthorizationError(message, errorData);
    default:
      throw new ApiError(response.status, message, errorData);
  }
};

// Generic fetch function with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    // Check if the response is empty
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return {
      data,
      status: response.status,
      message: data.message,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      throw new NetworkError();
    }

    throw new Error(`API request failed: ${(error as Error).message}`);
  }
}

// API client with typed methods
export const apiClient = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    
    register: (userData: { email: string; password: string; name: string }) => 
      apiFetch<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    
    logout: () => 
      apiFetch<{ success: boolean }>("/auth/logout", { 
        method: "POST" 
      }),
    
    me: () => 
      apiFetch<{ user: any }>("/auth/me"),
  },

  // Agents endpoints
  agents: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString();
      return apiFetch<{ agents: any[]; total: number; page: number; limit: number }>(
        `/agents${queryString ? `?${queryString}` : ""}`
      );
    },
    
    getById: (id: string) => 
      apiFetch<{ agent: any }>(`/agents/${id}`),
    
    create: (agent: any) => 
      apiFetch<{ agent: any }>("/agents", {
        method: "POST",
        body: JSON.stringify(agent),
      }),
    
    update: (id: string, agent: any) => 
      apiFetch<{ agent: any }>(`/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(agent),
      }),
    
    delete: (id: string) => 
      apiFetch<{ success: boolean }>(`/agents/${id}`, {
        method: "DELETE",
      }),
  },

  // Prompts endpoints
  prompts: {
    getAll: (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.category) queryParams.append("category", params.category);
      
      const queryString = queryParams.toString();
      return apiFetch<{ prompts: any[]; total: number; page: number; limit: number }>(
        `/prompts${queryString ? `?${queryString}` : ""}`
      );
    },
    
    getById: (id: string) => 
      apiFetch<{ prompt: any }>(`/prompts/${id}`),
    
    create: (prompt: any) => 
      apiFetch<{ prompt: any }>("/prompts", {
        method: "POST",
        body: JSON.stringify(prompt),
      }),
    
    update: (id: string, prompt: any) => 
      apiFetch<{ prompt: any }>(`/prompts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(prompt),
      }),
    
    delete: (id: string) => 
      apiFetch<{ success: boolean }>(`/prompts/${id}`, {
        method: "DELETE",
      }),
  },

  // User endpoints
  users: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString();
      return apiFetch<{ users: any[]; total: number; page: number; limit: number }>(
        `/users${queryString ? `?${queryString}` : ""}`
      );
    },
    
    getById: (id: string) => 
      apiFetch<{ user: any }>(`/users/${id}`),
    
    update: (id: string, user: any) => 
      apiFetch<{ user: any }>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(user),
      }),
    
    delete: (id: string) => 
      apiFetch<{ success: boolean }>(`/users/${id}`, {
        method: "DELETE",
      }),
    
    updateProfile: (profile: any) => 
      apiFetch<{ user: any }>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
      }),
    
    changePassword: (passwords: { currentPassword: string; newPassword: string }) => 
      apiFetch<{ success: boolean }>("/users/change-password", {
        method: "POST",
        body: JSON.stringify(passwords),
      }),
  },

  // Upload endpoints
  uploads: {
    upload: (file: File, type: "document" | "image" = "document") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      
      return apiFetch<{ url: string; fileId: string }>("/uploads", {
        method: "POST",
        body: formData,
        headers: {}, // Let the browser set the content type with boundary
      });
    },
    
    delete: (fileId: string) => 
      apiFetch<{ success: boolean }>(`/uploads/${fileId}`, {
        method: "DELETE",
      }),
  },

  // API Keys endpoints
  apiKeys: {
    getAll: () => 
      apiFetch<{ apiKeys: any[] }>("/api-keys"),
    
    create: (name: string) => 
      apiFetch<{ apiKey: any }>("/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    
    delete: (id: string) => 
      apiFetch<{ success: boolean }>(`/api-keys/${id}`, {
        method: "DELETE",
      }),
  },

  // Stats endpoints
  stats: {
    getDashboardStats: () => 
      apiFetch<{ stats: any }>("/stats/dashboard"),
    
    getAgentStats: (agentId: string) => 
      apiFetch<{ stats: any }>(`/stats/agents/${agentId}`),
  },
};

// Middleware to handle global errors
export const initializeApiErrorHandling = () => {
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    
    if (error instanceof ApiError) {
      if (error instanceof AuthenticationError) {
        // Handle authentication errors globally
        toast.error("Session expired", "Please log in again");
        // Redirect to login
        window.location.href = "/login";
        return;
      }
      
      // For other API errors, show a toast if not already handled
      toast.error(error.name, error.message);
    }
  });
}; 