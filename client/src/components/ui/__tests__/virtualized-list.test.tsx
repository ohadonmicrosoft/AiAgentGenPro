import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils';
import { VirtualizedList } from '../virtualized-list';

const mockItems = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  description: `Description for item ${i}`,
}));

describe('VirtualizedList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('renders without crashing', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div>{item.name}</div>}
      />
    );
    
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });
  
  it('renders visible items', () => {
    render(
      <VirtualizedList
        items={mockItems}
        height={200}
        fixedItemHeight={50}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
      />
    );
    
    // Only a subset of items should be rendered based on the container size and item height
    // With a 200px container and 50px items, we should see at most 4 items plus overscan (default 5)
    // So around 9 items should be visible
    
    // Check if some of the expected items are there
    expect(screen.getByTestId('item-0')).toBeInTheDocument(); // First item
    
    // Later items that should be visible with overscan
    expect(screen.getByTestId('item-4')).toBeInTheDocument();
    
    // Items that are far outside the viewport should not be rendered
    expect(screen.queryByTestId('item-50')).not.toBeInTheDocument();
  });
  
  it('calls onReachBottom when scrolling to the bottom', async () => {
    const onReachBottom = vi.fn();
    
    // Mock the scrolling behavior
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    
    const { container } = render(
      <VirtualizedList
        items={mockItems}
        height={200}
        fixedItemHeight={50}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
        onReachBottom={onReachBottom}
        bottomThreshold={90}
      />
    );
    
    // Get the virtualized list container
    const listContainer = screen.getByTestId('virtualized-list');
    
    // Simulate scroll to bottom
    Object.defineProperty(listContainer, 'scrollTop', { value: 4900 }); // Nearly scrolled to bottom
    Object.defineProperty(listContainer, 'scrollHeight', { value: 5000 }); // Total height
    Object.defineProperty(listContainer, 'clientHeight', { value: 200 }); // Visible height
    
    // Dispatch scroll event
    listContainer.dispatchEvent(new Event('scroll'));
    
    // Wait for scroll handler to be called
    await waitFor(() => {
      expect(onReachBottom).toHaveBeenCalledTimes(1);
    });
  });
  
  it('renders with custom class names', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div>{item.name}</div>}
        className="container-class"
        itemClassName="item-class"
        innerClassName="inner-class"
      />
    );
    
    expect(screen.getByTestId('virtualized-list')).toHaveClass('container-class');
  });
  
  it('renders nothing when items array is empty', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={(item) => <div>{item.name}</div>}
      />
    );
    
    expect(screen.queryByTestId('virtualized-list')).not.toBeInTheDocument();
  });
  
  it('uses custom getItemKey function if provided', () => {
    const getItemKey = vi.fn((index, item) => `custom-${item.id}`);
    
    render(
      <VirtualizedList
        items={mockItems.slice(0, 5)}
        renderItem={(item) => <div>{item.name}</div>}
        getItemKey={getItemKey}
      />
    );
    
    // The getItemKey function should be called for visible items
    expect(getItemKey).toHaveBeenCalled();
  });
  
  it('renders with screen reader content for accessibility', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div>{item.name}</div>}
      />
    );
    
    // Should have sr-only content with item count information
    const srOnlyContent = document.querySelector('.sr-only');
    expect(srOnlyContent).toBeInTheDocument();
    expect(srOnlyContent?.textContent).toContain('100 items');
  });
}); 