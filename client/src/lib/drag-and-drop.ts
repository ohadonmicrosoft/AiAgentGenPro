import type { Position } from '../types/drag-types';

/**
 * Gets the cursor position from a mouse or touch event
 * 
 * @param event - The mouse or touch event
 * @returns The cursor position
 */
export function getCursorPosition(
  event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
): Position {
  // Handle touch events
  if (
    'touches' in event ||
    (event as TouchEvent).targetTouches ||
    (event as TouchEvent).changedTouches
  ) {
    const touch = (event as TouchEvent).touches?.[0] ||
                  (event as TouchEvent).targetTouches?.[0] ||
                  (event as TouchEvent).changedTouches?.[0];

    if (touch) {
      return {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }

  // Handle mouse events
  return {
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
  };
}

/**
 * Checks if the cursor position is out of bounds
 * 
 * @param position - The cursor position
 * @param bounds - The bounds to check against (default: window dimensions)
 * @param threshold - The threshold to consider as out of bounds (default: 0)
 * @returns Whether the cursor is out of bounds
 */
export function isCursorOutOfBounds(
  position: Position,
  bounds: DOMRect | null = null,
  threshold = 0
): boolean {
  if (!bounds) {
    // Use window as bounds
    return (
      position.x < threshold ||
      position.y < threshold ||
      position.x > window.innerWidth - threshold ||
      position.y > window.innerHeight - threshold
    );
  }

  return (
    position.x < bounds.left - threshold ||
    position.y < bounds.top - threshold ||
    position.x > bounds.right + threshold ||
    position.y > bounds.bottom + threshold
  );
}

/**
 * Calculates the distance between two positions
 * 
 * @param posA - First position
 * @param posB - Second position
 * @returns The distance between positions
 */
export function getDistance(posA: Position, posB: Position): number {
  return Math.sqrt(
    Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2)
  );
}

/**
 * Calculates the center position of an element
 * 
 * @param element - The element to get the center of
 * @returns The center position
 */
export function getElementCenter(element: HTMLElement): Position {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Checks if a position is inside an element
 * 
 * @param position - The position to check
 * @param element - The element to check against
 * @returns Whether the position is inside the element
 */
export function isPositionInElement(
  position: Position,
  element: HTMLElement
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    position.x >= rect.left &&
    position.x <= rect.right &&
    position.y >= rect.top &&
    position.y <= rect.bottom
  );
}

/**
 * Creates an animated transition between elements
 * 
 * @param sourceElement - The source element
 * @param targetElement - The target element
 * @param duration - The animation duration in ms
 * @returns A promise that resolves when the animation is complete
 */
export function animateTransition(
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  duration = 300
): Promise<void> {
  return new Promise((resolve) => {
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    const deltaX = targetRect.left - sourceRect.left;
    const deltaY = targetRect.top - sourceRect.top;
    
    // Apply animation
    sourceElement.style.transition = `transform ${duration}ms ease-in-out`;
    sourceElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    // Reset after animation
    setTimeout(() => {
      sourceElement.style.transition = '';
      sourceElement.style.transform = '';
      resolve();
    }, duration);
  });
}

/**
 * Creates a proxy element for drag preview
 * 
 * @param element - The element to create a proxy for
 * @returns The proxy element
 */
export function createDragProxy(element: HTMLElement): HTMLElement {
  const rect = element.getBoundingClientRect();
  const proxy = element.cloneNode(true) as HTMLElement;
  
  // Style proxy element
  proxy.style.position = 'fixed';
  proxy.style.left = `${rect.left}px`;
  proxy.style.top = `${rect.top}px`;
  proxy.style.width = `${rect.width}px`;
  proxy.style.height = `${rect.height}px`;
  proxy.style.margin = '0';
  proxy.style.pointerEvents = 'none';
  proxy.style.zIndex = '9999';
  proxy.style.opacity = '0.8';
  proxy.style.boxShadow = '0 5px 10px rgba(0,0,0,0.15)';
  
  // Add to document
  document.body.appendChild(proxy);
  
  return proxy;
} 