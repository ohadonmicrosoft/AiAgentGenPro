import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { withErrorBoundary } from './error-boundary';

/**
 * Props for the virtualized list component
 */
export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /** Estimated height of each item in pixels */
  estimatedItemHeight?: number;
  
  /** Fixed height for all items (more performant than estimatedHeight) */
  fixedItemHeight?: number;
  
  /** Height of the virtualized container */
  height?: number | string;
  
  /** Width of the virtualized container */
  width?: number | string;
  
  /** Additional class name for the container */
  className?: string;
  
  /** Class name for each item in the list */
  itemClassName?: string;
  
  /** Class name for the inner container */
  innerClassName?: string;
  
  /** Whether to overscan items (render more than visible) */
  overscan?: number;
  
  /** Unique identifier function for each item */
  getItemKey?: (index: number, item: T) => string | number;
  
  /** Callback when scrolling reaches the bottom threshold */
  onReachBottom?: () => void;
  
  /** Threshold percentage from bottom to trigger onReachBottom */
  bottomThreshold?: number;
}

/**
 * A virtualized list component that efficiently renders large lists.
 * Only the visible items (and a small overscan buffer) are actually rendered in the DOM.
 * 
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={users}
 *   height={400} 
 *   fixedItemHeight={50}
 *   renderItem={(user, index) => (
 *     <div className="p-4 border-b">
 *       <h3>{user.name}</h3>
 *       <p>{user.email}</p>
 *     </div>
 *   )}
 *   onReachBottom={() => loadMoreUsers()}
 * />
 * ```
 */
function VirtualizedListComponent<T>({
  items,
  renderItem,
  estimatedItemHeight = 50,
  fixedItemHeight,
  height = 400,
  width = '100%',
  className = '',
  itemClassName = '',
  innerClassName = '',
  overscan = 5,
  getItemKey,
  onReachBottom,
  bottomThreshold = 90, // 90% scroll position triggers bottom reached
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Calculate container style
  const containerStyle: React.CSSProperties = {
    height,
    width,
    overflow: 'auto',
    position: 'relative',
  };
  
  // Configure virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => fixedItemHeight ?? estimatedItemHeight,
    overscan,
    getItemKey: getItemKey,
  });
  
  // Handle scrolling, especially for infinite loading
  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    
    // Update scroll position percentage
    const position = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollPosition(position);
    
    // Detect when we've scrolled near the bottom
    if (position >= bottomThreshold && onReachBottom) {
      onReachBottom();
    }
  }, [bottomThreshold, onReachBottom]);
  
  // Add scroll listener
  useEffect(() => {
    const currentRef = parentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  // Render nothing if there are no items
  if (!items.length) {
    return null;
  }
  
  return (
    <div 
      ref={parentRef}
      style={containerStyle}
      className={className}
      data-testid="virtualized-list"
      aria-label="Virtualized List"
    >
      <div
        className={innerClassName}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        role="list"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                ...(fixedItemHeight ? { height: `${fixedItemHeight}px` } : {}),
              }}
              role="listitem"
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
      
      {/* Add screen reader content for accessibility */}
      <div className="sr-only">
        List contains {items.length} items, showing a portion of them.
        {scrollPosition > 0 && `Currently at ${Math.round(scrollPosition)}% scroll position.`}
      </div>
    </div>
  );
}

// Apply error boundary to the component
export const VirtualizedList = withErrorBoundary(VirtualizedListComponent) as typeof VirtualizedListComponent;

export default VirtualizedList; 