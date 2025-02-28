import { AlertCircle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string; // Component name for better error tracking
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree.
 * It logs the errors and displays a fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to logging service
    this.reportErrorToServer(error, errorInfo, this.props.name || "ErrorBoundary");
  }

  private reportErrorToServer = (
    error: Error,
    errorInfo: ErrorInfo,
    componentName: string,
  ): void => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`Error in ${componentName}`);
      console.error(error);
      console.error("Component stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // In production, send to error tracking service
    try {
      // Here you would typically send to your error tracking service
      // Example: Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
      console.error(`[${componentName}]`, error);
    } catch (loggingError) {
      // Fallback if error reporting fails
      console.error("Failed to report error:", loggingError);
    }
  };

  resetErrorBoundary = (): void => {
    // Reset the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: undefined,
    });

    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Something went wrong</h3>
          </div>
          <p className="text-sm mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.resetErrorBoundary}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-background hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.FC<P> {
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps} name={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
} 