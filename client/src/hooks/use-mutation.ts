import { useState } from "react";
import {
  useMutation as useReactQueryMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface MutationOptions<TData, TError, TVariables, TContext> {
  /**
   * The mutation function that performs the API call
   */
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  /**
   * Options for the mutation
   */
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >;
  
  /**
   * Toast configuration
   */
  toast?: {
    /**
     * Whether to show a success toast when the mutation succeeds
     * @default true
     */
    success?: boolean | { title: string; description?: string };
    
    /**
     * Whether to show an error toast when the mutation fails
     * @default true
     */
    error?: boolean | { title: string; description?: string };
    
    /**
     * Whether to show a loading toast when the mutation is in progress
     * @default false
     */
    loading?: boolean | { title: string; description?: string };
  };
  
  /**
   * Error handling configuration
   */
  errorHandling?: {
    /**
     * Custom error handler
     */
    onError?: (error: TError) => void;
    
    /**
     * Whether to retry the mutation on error
     * @default false
     */
    retry?: boolean | number;
    
    /**
     * Custom error formatter
     */
    formatError?: (error: TError) => { title: string; description?: string };
  };
}

/**
 * A wrapper around React Query's useMutation that adds toast notifications and error handling
 */
export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  config: MutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> & {
  isSubmitting: boolean;
} {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutationFn, options = {}, toast: toastConfig = {}, errorHandling = {} } = config;
  
  const defaultSuccessToast = { title: "Success", description: "Operation completed successfully" };
  const defaultErrorToast = { title: "Error", description: "Something went wrong. Please try again." };
  const defaultLoadingToast = { title: "Loading", description: "Operation in progress..." };
  
  const showSuccessToast = toastConfig.success !== false;
  const showErrorToast = toastConfig.error !== false;
  const showLoadingToast = !!toastConfig.loading;
  
  const successToastConfig = typeof toastConfig.success === "object" 
    ? toastConfig.success 
    : defaultSuccessToast;
  
  const errorToastConfig = typeof toastConfig.error === "object" 
    ? toastConfig.error 
    : defaultErrorToast;
  
  const loadingToastConfig = typeof toastConfig.loading === "object" 
    ? toastConfig.loading 
    : defaultLoadingToast;
  
  const formatError = errorHandling.formatError || ((error: TError) => {
    if (error instanceof Error) {
      return {
        title: "Error",
        description: error.message || "Something went wrong. Please try again."
      };
    }
    return defaultErrorToast;
  });

  const mutation = useReactQueryMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
    onMutate: async (variables) => {
      setIsSubmitting(true);
      
      if (showLoadingToast) {
        toast({
          title: loadingToastConfig.title,
          description: loadingToastConfig.description,
        });
      }
      
      if (options.onMutate) {
        return await options.onMutate(variables);
      }
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(
          successToastConfig.title,
          successToastConfig.description
        );
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        const formattedError = formatError(error);
        toast.error(
          formattedError.title,
          formattedError.description
        );
      }
      
      if (errorHandling.onError) {
        errorHandling.onError(error);
      }
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsSubmitting(false);
      
      if (options.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
    retry: errorHandling.retry || false,
  });

  return {
    ...mutation,
    isSubmitting,
  };
} 