import { useEffect, useRef, useState } from "react";

/**
 * Interface for the announcer options
 */
interface AnnouncerOptions {
  /** The delay in milliseconds before clearing the announcement */
  clearDelay?: number;
  /** Politeness level for screen readers */
  politeness?: "polite" | "assertive";
}

/**
 * Hook that provides a function to announce messages to screen readers
 *
 * @example
 * ```tsx
 * const announce = useAnnouncer();
 *
 * // When some action occurs
 * const handleAction = () => {
 *   // Perform action...
 *   announce('Action completed successfully');
 * };
 * ```
 */
export function useAnnouncer(options: AnnouncerOptions = {}) {
  const { clearDelay = 5000, politeness = "polite" } = options;

  const [message, setMessage] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear the announcement after delay
  useEffect(() => {
    if (message) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage("");
      }, clearDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearDelay]);

  // Function to announce messages
  const announce = (text: string) => {
    setMessage(text);
  };

  return {
    announce,
    message,
    announcerProps: {
      "aria-live": politeness,
      "aria-atomic": "true",
      className: "sr-only",
    },
  };
}
