import {
  DefaultOptions,
  QueryClient,
  type QueryClientConfig,
  type QueryFunction,
} from "@tanstack/react-query";
import { offlinePlugin } from "./offline-plugin";

export enum UnauthorizedBehavior {
  Throw = "throw",
  ReturnNull = "returnNull",
}

type ApiRequestOptions = {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  headers?: Record<string, string>;
};

// Network error detection
function isNetworkError(error: any): boolean {
  return (
    !window.navigator.onLine ||
    error.message === "Failed to fetch" ||
    error.message.includes("NetworkError") ||
    error.message.includes("Network request failed")
  );
}

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      
      // Retry network errors more times
      if (isNetworkError(error)) {
        return failureCount < 5;
      }
      
      // Default retry behavior
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  mutations: {
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      
      // Retry network errors a few times
      if (isNetworkError(error)) {
        return failureCount < 3;
      }
      
      // Default: don't retry mutations
      return false;
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
  queryCache: {
    onError: (error) => {
      console.error("Query cache error:", error);
    },
  },
});

// Add the offline plugin
queryClient.getQueryCache().config.defaultOptions = {
  queries: {
    ...defaultQueryOptions.queries,
    ...offlinePlugin({
      queryKeyFilter: (queryKey) => {
        // Only cache GET requests that don't include sensitive data
        const firstPart = queryKey[0];
        if (typeof firstPart === "string") {
          return !firstPart.includes("auth") && !firstPart.includes("user");
        }
        return false;
      },
    }),
  },
}; 