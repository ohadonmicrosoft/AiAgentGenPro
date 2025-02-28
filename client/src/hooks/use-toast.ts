import { toast, useToast as useToastImpl } from "@/lib/hooks/use-toast";

export interface ToastProps {
  title: string;
  description?: string;
}

/**
 * Hook for displaying toast notifications
 * This is a wrapper around our toast implementation
 */
export function useToast() {
  const { toast: toastFn } = useToastImpl();
  
  return {
    toast: ({ title, description }: { title: string; description?: string }) => {
      toastFn({
        title,
        description,
        variant: "default"
      });
    },
    success: (title: string, description?: string) => {
      toastFn({
        title,
        description,
        variant: "success"
      });
    },
    error: (title: string, description?: string) => {
      toastFn({
        title,
        description,
        variant: "destructive"
      });
    },
    warning: (title: string, description?: string) => {
      toastFn({
        title,
        description,
        variant: "warning"
      });
    },
    info: (title: string, description?: string) => {
      toastFn({
        title,
        description,
        variant: "info"
      });
    },
  };
}
