import { toast } from "@/components/ui/toast";

export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export type ToastActionElement = React.ReactElement<{
  altText: string;
  onClick: () => void;
}>;

/**
 * Hook for displaying toast notifications
 * This is a wrapper around the sonner toast library
 */
export function useToast() {
  return {
    toast: ({ title, description, action, ...props }: ToastProps) => {
      toast(title, {
        description,
        action,
        ...props,
      });
    },
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },
    promise: toast.promise,
  };
} 