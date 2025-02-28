import { useAuth as useAuthContext } from "@/contexts/auth-context";

/**
 * Hook for accessing authentication state and methods.
 * This is a forwarding hook that uses the auth context under the hood.
 * 
 * @returns Authentication state and methods
 */
export function useAuth() {
  return useAuthContext();
} 