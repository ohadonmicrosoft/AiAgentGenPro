/**
 * Type definitions for drag and drop functionality
 */

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Draggable item interface
 */
export interface DraggableItem {
  id: string;
  type: string;
  index?: number;
  data?: any;
  [key: string]: any;
}

/**
 * Drop location
 */
export interface DropLocation {
  id: string;
  index: number;
}

/**
 * Drag state
 */
export interface DragState {
  isDragging: boolean;
  startPosition: Position | null;
  currentPosition: Position | null;
  draggedItem: DraggableItem | null;
  draggedId: string | null;
  sourceContainerId: string | null;
  targetContainerId: string | null;
}

/**
 * Drag result returned when a drag operation ends
 */
export interface DragResult {
  item: DraggableItem;
  source: DropLocation;
  destination: DropLocation | null;
  isDropped: boolean;
  isReordered: boolean;
  isMoved: boolean;
}

/**
 * Props for creating a draggable element
 */
export interface DraggableProps {
  id: string;
  type: string;
  index?: number;
  containerId: string;
  isDragDisabled?: boolean;
  data?: any;
  children: React.ReactNode;
}

/**
 * Props for creating a drop container
 */
export interface DropContainerProps {
  id: string;
  accepts: string[];
  onDrop?: (result: DragResult) => void;
  children: React.ReactNode;
}

// Container that can accept dropped items
export interface DropContainer {
  id: string;
  accepts: string[]; // Types of items this container accepts
  items: DraggableItem[];
}

// Configuration for draggable items
export interface DraggableConfig {
  id: string;
  dragDisabled?: boolean;
  dragHandleSelector?: string;
  animateLayout?: boolean;
  onDragStart?: (item: DraggableItem) => void;
  onDragEnd?: (result: DragResult) => void;
}

// Configuration for drop containers
export interface DroppableConfig {
  id: string;
  accepts: string[];
  isDisabled?: boolean;
  orientation?: "vertical" | "horizontal";
  onDragEnter?: (item: DraggableItem) => void;
  onDragLeave?: (item: DraggableItem) => void;
  onDrop?: (result: DragResult) => void;
} 