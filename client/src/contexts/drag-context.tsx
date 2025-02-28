import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  memo,
} from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { getCursorPosition, isCursorOutOfBounds } from "../lib/drag-and-drop";
import { AppError } from "../lib/error-handling";
import type {
  Position,
  DragState,
  DragResult,
  DraggableItem,
} from "../types/drag-types";

/**
 * Initial drag state
 */
const initialDragState: DragState = {
  isDragging: false,
  startPosition: null,
  currentPosition: null,
  draggedItem: null,
  draggedId: null,
  sourceContainerId: null,
  targetContainerId: null,
};

/**
 * Actions for drag state reducer
 */
type DragAction =
  | {
      type: "START_DRAG";
      payload: {
        item: any;
        id: string;
        containerId: string;
        position: Position;
      };
    }
  | {
      type: "UPDATE_DRAG";
      payload: { position: Position; targetContainerId?: string };
    }
  | {
      type: "END_DRAG";
      payload?: { targetContainerId?: string; targetIndex?: number };
    }
  | { type: "CANCEL_DRAG" }
  | { type: "SET_TARGET_CONTAINER"; payload: { containerId: string | null } };

/**
 * Reducer for drag state
 */
function dragReducer(state: DragState, action: DragAction): DragState {
  switch (action.type) {
    case "START_DRAG":
      return {
        ...state,
        isDragging: true,
        startPosition: action.payload.position,
        currentPosition: action.payload.position,
        draggedItem: action.payload.item,
        draggedId: action.payload.id,
        sourceContainerId: action.payload.containerId,
        targetContainerId: action.payload.containerId, // Initially the same as source
      };

    case "UPDATE_DRAG":
      return {
        ...state,
        currentPosition: action.payload.position,
        targetContainerId:
          action.payload.targetContainerId || state.targetContainerId,
      };

    case "END_DRAG":
      return {
        ...state,
        isDragging: false,
        targetContainerId:
          action.payload?.targetContainerId || state.targetContainerId,
      };

    case "CANCEL_DRAG":
      return initialDragState;

    case "SET_TARGET_CONTAINER":
      return {
        ...state,
        targetContainerId: action.payload.containerId,
      };

    default:
      return state;
  }
}

/**
 * Context interface
 */
interface DragContextValue {
  dragState: DragState;
  startDrag: (
    item: any,
    id: string,
    containerId: string,
    event: React.MouseEvent | React.TouchEvent,
  ) => void;
  updateDrag: (
    event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
  ) => void;
  endDrag: (
    targetContainerId?: string,
    targetIndex?: number,
  ) => DragResult | null;
  cancelDrag: () => void;
  setTargetContainer: (containerId: string | null) => void;
  registerDropContainer: (
    id: string,
    element: HTMLElement,
    accepts: string[],
  ) => void;
  unregisterDropContainer: (id: string) => void;
  prefersReducedMotion: boolean;
}

// Create context
const DragContext = createContext<DragContextValue | undefined>(undefined);

/**
 * Map to store drop container references
 */
type DropContainerRef = {
  element: HTMLElement;
  accepts: string[];
};

/**
 * Error class for drag operations
 */
export class DragError extends AppError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = "DragError";
  }
}

/**
 * Provider component for drag and drop functionality
 *
 * @example
 * ```tsx
 * <DragProvider>
 *   <DraggableComponent />
 *   <DropContainer />
 * </DragProvider>
 * ```
 */
export const DragProvider: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const [dragState, dispatch] = useReducer(dragReducer, initialDragState);
    const dropContainersRef = useRef<Map<string, DropContainerRef>>(new Map());
    const prefersReducedMotion = useReducedMotion();

    // Track document event listeners
    const dragListenersAttached = useRef(false);

    // Register a drop container
    const registerDropContainer = useCallback(
      (id: string, element: HTMLElement, accepts: string[]) => {
        if (!id || !element) {
          throw new DragError(
            "Invalid drop container registration parameters",
            "INVALID_DROP_CONTAINER",
          );
        }

        dropContainersRef.current.set(id, { element, accepts });
      },
      [],
    );

    // Unregister a drop container
    const unregisterDropContainer = useCallback((id: string) => {
      if (!id) {
        throw new DragError(
          "Invalid drop container id for unregistration",
          "INVALID_DROP_CONTAINER_ID",
        );
      }

      dropContainersRef.current.delete(id);
    }, []);

    // Start drag operation
    const startDrag = useCallback(
      (
        item: any,
        id: string,
        containerId: string,
        event: React.MouseEvent | React.TouchEvent,
      ) => {
        try {
          if (!item || !id || !containerId) {
            throw new DragError(
              "Invalid drag parameters",
              "INVALID_DRAG_PARAMS",
            );
          }

          // Prevent default browser behavior
          event.preventDefault();

          const position = getCursorPosition(event);

          dispatch({
            type: "START_DRAG",
            payload: { item, id, containerId, position },
          });

          // Announce to screen readers
          const dragAnnouncement = document.createElement("div");
          dragAnnouncement.setAttribute("aria-live", "assertive");
          dragAnnouncement.setAttribute("class", "sr-only");
          dragAnnouncement.textContent = `Started dragging ${item.type || "item"}`;
          document.body.appendChild(dragAnnouncement);

          // Clean up announcement
          setTimeout(() => {
            document.body.removeChild(dragAnnouncement);
          }, 1000);
        } catch (error) {
          console.error("Error starting drag:", error);
          // Don't rethrow to prevent UI disruption
        }
      },
      [],
    );

    // Update drag position
    const updateDrag = useCallback(
      (
        event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
      ) => {
        if (!dragState.isDragging) return;

        try {
          const position = getCursorPosition(event);

          // Find which container we're over (if any)
          let targetContainerId: string | null = null;
          let maxOverlapArea = 0;

          dropContainersRef.current.forEach((container, id) => {
            const { element, accepts } = container;

            // Skip if the container doesn't accept this type of item
            if (
              dragState.draggedItem &&
              !accepts.includes(dragState.draggedItem.type)
            ) {
              return;
            }

            const rect = element.getBoundingClientRect();

            // Check if cursor is inside this container
            if (
              position.x >= rect.left &&
              position.x <= rect.right &&
              position.y >= rect.top &&
              position.y <= rect.bottom
            ) {
              // Calculate area to find the most specific container (in case of nesting)
              const area = rect.width * rect.height;
              if (area < maxOverlapArea || maxOverlapArea === 0) {
                maxOverlapArea = area;
                targetContainerId = id;
              }
            }
          });

          // Only update if there's a change in position or target
          if (
            !dragState.currentPosition ||
            position.x !== dragState.currentPosition.x ||
            position.y !== dragState.currentPosition.y ||
            targetContainerId !== dragState.targetContainerId
          ) {
            dispatch({
              type: "UPDATE_DRAG",
              payload: { position, targetContainerId },
            });
          }
        } catch (error) {
          console.error("Error updating drag position:", error);
          // Don't rethrow to prevent UI disruption
        }
      },
      [
        dragState.isDragging,
        dragState.draggedItem,
        dragState.currentPosition,
        dragState.targetContainerId,
      ],
    );

    // End drag operation
    const endDrag = useCallback(
      (targetContainerId?: string, targetIndex?: number): DragResult | null => {
        if (
          !dragState.isDragging ||
          !dragState.draggedItem ||
          !dragState.draggedId ||
          !dragState.sourceContainerId
        ) {
          return null;
        }

        try {
          const finalTargetId =
            targetContainerId || dragState.targetContainerId;

          const result: DragResult = {
            item: dragState.draggedItem,
            source: {
              id: dragState.sourceContainerId,
              index: dragState.draggedItem.index || 0,
            },
            destination: finalTargetId
              ? { id: finalTargetId, index: targetIndex || 0 }
              : null,
            isDropped: Boolean(finalTargetId),
            isReordered: finalTargetId === dragState.sourceContainerId,
            isMoved:
              Boolean(finalTargetId) &&
              finalTargetId !== dragState.sourceContainerId,
          };

          dispatch({
            type: "END_DRAG",
            payload: { targetContainerId: finalTargetId, targetIndex },
          });

          // Announce result to screen readers
          const dragAnnouncement = document.createElement("div");
          dragAnnouncement.setAttribute("aria-live", "assertive");
          dragAnnouncement.setAttribute("class", "sr-only");

          if (result.isDropped) {
            if (result.isReordered) {
              dragAnnouncement.textContent =
                "Item reordered within the same container";
            } else {
              dragAnnouncement.textContent = "Item moved to new container";
            }
          } else {
            dragAnnouncement.textContent = "Drag cancelled";
          }

          document.body.appendChild(dragAnnouncement);

          // Reset drag state after a short delay
          setTimeout(() => {
            dispatch({ type: "CANCEL_DRAG" });
            // Clean up announcement
            document.body.removeChild(dragAnnouncement);
          }, 100);

          return result;
        } catch (error) {
          console.error("Error ending drag:", error);
          dispatch({ type: "CANCEL_DRAG" });
          return null;
        }
      },
      [dragState],
    );

    // Cancel drag operation
    const cancelDrag = useCallback(() => {
      dispatch({ type: "CANCEL_DRAG" });

      // Announce cancellation
      const dragAnnouncement = document.createElement("div");
      dragAnnouncement.setAttribute("aria-live", "assertive");
      dragAnnouncement.setAttribute("class", "sr-only");
      dragAnnouncement.textContent = "Drag operation cancelled";
      document.body.appendChild(dragAnnouncement);

      // Clean up announcement
      setTimeout(() => {
        document.body.removeChild(dragAnnouncement);
      }, 1000);
    }, []);

    // Set target container manually
    const setTargetContainer = useCallback((containerId: string | null) => {
      dispatch({
        type: "SET_TARGET_CONTAINER",
        payload: { containerId },
      });
    }, []);

    // Set up and clean up global event listeners
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => updateDrag(e);
      const handleTouchMove = (e: TouchEvent) => updateDrag(e);

      const handleMouseUp = (e: MouseEvent) => {
        if (dragState.isDragging) {
          endDrag();
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (dragState.isDragging) {
          endDrag();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        // Cancel drag on escape key
        if (e.key === "Escape" && dragState.isDragging) {
          cancelDrag();
        }
      };

      // Only attach listeners when dragging
      if (dragState.isDragging && !dragListenersAttached.current) {
        document.addEventListener("mousemove", handleMouseMove, {
          passive: false,
        });
        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchend", handleTouchEnd);
        document.addEventListener("keydown", handleKeyDown);
        dragListenersAttached.current = true;

        // Set cursor style on body
        document.body.style.cursor = "grabbing";

        // Add class to body for styling during drag
        document.body.classList.add("dragging");
      } else if (!dragState.isDragging && dragListenersAttached.current) {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("keydown", handleKeyDown);
        dragListenersAttached.current = false;

        // Reset cursor
        document.body.style.cursor = "";

        // Remove class from body
        document.body.classList.remove("dragging");
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("keydown", handleKeyDown);

        // Cleanup styles
        document.body.style.cursor = "";
        document.body.classList.remove("dragging");
      };
    }, [dragState.isDragging, updateDrag, endDrag, cancelDrag]);

    const contextValue: DragContextValue = {
      dragState,
      startDrag,
      updateDrag,
      endDrag,
      cancelDrag,
      setTargetContainer,
      registerDropContainer,
      unregisterDropContainer,
      prefersReducedMotion,
    };

    return (
      <DragContext.Provider value={contextValue}>
        {children}
      </DragContext.Provider>
    );
  },
);

DragProvider.displayName = "DragProvider";

/**
 * Hook to use the drag context
 *
 * @returns {DragContextValue} The drag context value
 * @throws {DragError} If used outside of a DragProvider
 *
 * @example
 * ```tsx
 * const { dragState, startDrag, endDrag } = useDragContext();
 * ```
 */
export const useDragContext = () => {
  const context = useContext(DragContext);

  if (context === undefined) {
    throw new DragError(
      "useDragContext must be used within a DragProvider",
      "CONTEXT_OUTSIDE_PROVIDER",
    );
  }

  return context;
};
