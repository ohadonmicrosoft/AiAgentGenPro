import type { QueryClient } from "@tanstack/react-query";

/**
 * Simple storage interface for the offline cache
 */
interface OfflineStorage {
  getItem: (key: string) => Promise<unknown | null>;
  setItem: (key: string, value: unknown) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * LocalStorage implementation of OfflineStorage
 */
class LocalStorageAdapter implements OfflineStorage {
  private prefix = "offline-cache:";

  async getItem(key: string): Promise<unknown | null> {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to get item from localStorage:", e);
      return null;
    }
  }

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set item in localStorage:", e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.error("Failed to remove item from localStorage:", e);
    }
  }
}

/**
 * Configuration options for the offline plugin
 */
interface OfflinePluginOptions {
  storage?: OfflineStorage;
  queryKeyFilter?: (queryKey: unknown[]) => boolean;
}

/**
 * Creates an offline plugin for React Query
 */
export function offlinePlugin(options: OfflinePluginOptions = {}) {
  const storage = options.storage || new LocalStorageAdapter();
  const queryKeyFilter = options.queryKeyFilter || (() => true);

  return {
    onSuccess: async (data: unknown, query: any) => {
      const queryKey = query.queryKey;
      
      if (queryKeyFilter(queryKey)) {
        await storage.setItem(JSON.stringify(queryKey), data);
      }
    },
    
    onError: async (error: Error, query: any) => {
      const queryKey = query.queryKey;
      
      if (queryKeyFilter(queryKey) && !window.navigator.onLine) {
        const cachedData = await storage.getItem(JSON.stringify(queryKey));
        if (cachedData) {
          return cachedData;
        }
      }
      
      throw error;
    },
  };
} 