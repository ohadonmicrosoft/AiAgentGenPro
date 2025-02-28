import { auth } from '../firebase';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(message: string, status: number, data?: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  withAuth?: boolean;
}

/**
 * Typed API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    this.defaultTimeout = 30000; // 30 seconds
  }

  /**
   * Set authorization header with Firebase ID token
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) {
      throw new ApiError('User not authenticated', 401);
    }

    try {
      const token = await user.getIdToken();
      return { 'Authorization': `Bearer ${token}` };
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new ApiError('Failed to authenticate request', 401);
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Make a request with fetch API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options?: ApiRequestOptions,
    body?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout, withAuth = true } = options || {};
    
    // Combine headers
    let requestHeaders = { ...this.defaultHeaders, ...headers };
    
    // Add auth header if needed
    if (withAuth) {
      try {
        const authHeader = await this.getAuthHeader();
        requestHeaders = { ...requestHeaders, ...authHeader };
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          throw error;
        }
        // Continue without auth header if not authenticated and not required
      }
    }
    
    // Build request URL
    const url = this.buildUrl(endpoint, params);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      // Parse response
      let data;
      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }
      
      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>('GET', endpoint, options);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any, options?: ApiRequestOptions): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await this.request<T>('POST', endpoint, options, data);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any, options?: ApiRequestOptions): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await this.request<T>('PUT', endpoint, options, data);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any, options?: ApiRequestOptions): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await this.request<T>('PATCH', endpoint, options, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>('DELETE', endpoint, options);
    return response.data;
  }
}

// Create service-specific API clients
export const agentsApi = new ApiClient('/api/agents');
export const usersApi = new ApiClient('/api/users');
export const promptsApi = new ApiClient('/api/prompts');
export const conversationsApi = new ApiClient('/api/conversations'); 