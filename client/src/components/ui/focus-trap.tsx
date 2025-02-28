import { useEffect, useRef, useCallback } from "react";

/**
 * FocusTrap component that traps focus within its children when active.
 *
 * This is useful for modals, dialogs, and other components that should capture
 * and contain keyboard focus for accessibility purposes.
 *
 * @example
 * ```tsx
 * <FocusTrap active={isModalOpen}>
 *   <div className="modal">
 *     <button>Close</button>
 *     <input type="text" />
 *   </div>
 * </FocusTrap>
 * ```
 */
interface FocusTrapProps {
  /** The content to render within the focus trap */
  children: React.ReactNode;

  /** Whether the focus trap is active */
  active?: boolean;

  /** Whether to auto-focus the first focusable element when activated */
  autoFocus?: boolean;

  /** Whether to restore focus to the previously focused element when deactivated */
  restoreFocus?: boolean;
}

export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  restoreFocus = true,
}: FocusTrapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the element that was focused before the trap was activated
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Get all focusable elements within the trap
  const getFocusableElements = useCallback(() => {
    if (!rootRef.current) return [];

    return Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
    );
  }, []);

  // Focus the first element when activated
  useEffect(() => {
    if (!active || !autoFocus) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [active, autoFocus, getFocusableElements]);

  // Handle tabbing to keep focus inside
  useEffect(() => {
    if (!active) return;

    const root = rootRef.current;
    if (!root) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Only handle Tab key
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift+Tab on first element, wrap to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // If Tab on last element, wrap to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    root.addEventListener("keydown", handleKeyDown);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, getFocusableElements]);

  return (
    <div ref={rootRef} data-focus-trap={active ? "active" : "inactive"}>
      {children}
    </div>
  );
}

export default FocusTrap;
