import { useState, useEffect } from "react";
import {
  useForm as useReactHookForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "./use-toast";

export interface UseFormConfig<
  TFormValues extends FieldValues,
  Schema extends z.ZodType<any, any>,
> extends Omit<UseFormProps<TFormValues>, "resolver"> {
  /**
   * The Zod schema for form validation
   */
  schema?: Schema;

  /**
   * Default values for the form
   */
  defaultValues?: UseFormProps<TFormValues>["defaultValues"];

  /**
   * Function to call when the form is submitted successfully
   */
  onSubmit?: SubmitHandler<TFormValues>;

  /**
   * Function to call when the form submission has validation errors
   */
  onError?: SubmitErrorHandler<TFormValues>;

  /**
   * Toast configuration for form submission
   */
  toast?: {
    /**
     * Whether to show a success toast when the form is submitted successfully
     * @default false
     */
    success?: boolean | { title: string; description?: string };

    /**
     * Whether to show an error toast when the form submission fails
     * @default false
     */
    error?: boolean | { title: string; description?: string };
  };
}

/**
 * Custom hook that enhances React Hook Form with Zod validation and toast notifications
 */
export function useForm<
  TFormValues extends FieldValues,
  Schema extends z.ZodType<any, any>,
>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  toast: toastConfig,
  ...formConfig
}: UseFormConfig<TFormValues, Schema>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useReactHookForm<TFormValues>({
    ...formConfig,
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitSuccessful },
  } = methods;

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Create a custom submit handler
  const submitHandler = handleSubmit(
    async (data) => {
      setIsSubmitting(true);

      try {
        if (onSubmit) {
          await onSubmit(data);
        }

        // Show success toast if configured
        if (toastConfig?.success) {
          const successToast =
            typeof toastConfig.success === "object"
              ? toastConfig.success
              : {
                  title: "Success",
                  description: "Form submitted successfully",
                };

          toast.success(successToast.title, successToast.description);
        }
      } catch (error) {
        // Show error toast if configured
        if (toastConfig?.error) {
          const errorToast =
            typeof toastConfig.error === "object"
              ? toastConfig.error
              : {
                  title: "Error",
                  description:
                    error instanceof Error
                      ? error.message
                      : "Form submission failed",
                };

          toast.error(errorToast.title, errorToast.description);
        }

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    (errors) => {
      // Show error toast for validation errors
      if (toastConfig?.error) {
        const errorToast =
          typeof toastConfig.error === "object"
            ? toastConfig.error
            : { title: "Error", description: "Please fix the form errors" };

        toast.error(errorToast.title, errorToast.description);
      }

      if (onError) {
        onError(errors);
      }
    },
  );

  return {
    ...methods,
    submitHandler,
    isSubmitting,
    isSubmitSuccessful,
  };
}

/**
 * Typed interface for the form component
 */
export type FormReturn<T extends FieldValues = FieldValues> =
  UseFormReturn<T> & {
    submitHandler: ReturnType<typeof useForm<T, any>>["submitHandler"];
    isSubmitting: boolean;
    isSubmitSuccessful: boolean;
  };

/**
 * Utility type to infer form schema type from zod schema
 */
export type FormSchemaType<T extends z.ZodType<any, any>> = z.infer<T>;
