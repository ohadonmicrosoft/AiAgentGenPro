import React from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

/**
 * A fallback UI component displayed when an error is caught by an ErrorBoundary
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="flex flex-col items-center max-w-md p-6 rounded-lg shadow-lg bg-card">
        <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
        <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>

        {error && (
          <div className="p-4 my-4 overflow-auto text-sm text-left rounded bg-muted max-h-48">
            <p className="font-semibold">Error:</p>
            <p className="whitespace-pre-wrap">{error.message}</p>
          </div>
        )}

        <p className="mb-4 text-muted-foreground">
          We apologize for the inconvenience. Please try again or contact
          support if the problem persists.
        </p>

        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} variant="default">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
