import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/utils';
import { DragProvider, useDragContext, DragError } from './drag-context';
import type { Position } from '../types/drag-types';

// Mock component that uses the drag context
const TestComponent: React.FC = () => {
  const { 
    dragState, 
    startDrag, 
    updateDrag, 
    endDrag, 
    cancelDrag,
    setTargetContainer,
    registerDropContainer,
    unregisterDropContainer,
    prefersReducedMotion
  } = useDragContext();

  return (
    <div>
      <div data-testid="drag-state">
        {JSON.stringify(dragState)}
      </div>
      <button 
        data-testid="start-drag-btn"
        onClick={(e) => startDrag({ type: 'test-item', id: 'item-1' }, 'item-1', 'container-1', e)}
      >
        Start Drag
      </button>
      <button 
        data-testid="cancel-drag-btn"
        onClick={() => cancelDrag()}
      >
        Cancel Drag
      </button>
      <button 
        data-testid="end-drag-btn"
        onClick={() => endDrag()}
      >
        End Drag
      </button>
      <button 
        data-testid="set-target-btn"
        onClick={() => setTargetContainer('container-2')}
      >
        Set Target
      </button>
      <div data-testid="reduced-motion">
        {prefersReducedMotion ? 'reduced' : 'normal'}
      </div>
    </div>
  );
};

// Mock component that throws an error
const ErrorComponent: React.FC = () => {
  try {
    useDragContext();
    return <div>This should not render</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
};

describe('DragContext', () => {
  // Mock createDragProxy
  const mockCreateDragProxy = vi.fn();
  
  // Mock getElementById
  const mockGetElementById = vi.fn();
  
  // Mock the document methods
  beforeEach(() => {
    // Mock createElement
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName) => {
      const el = originalCreateElement.call(document, tagName);
      // Mock element's methods if needed
      return el;
    });
    
    // Mock appendChild
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = vi.fn((child) => {
      return originalAppendChild.call(document.body, child);
    });
    
    // Mock removeChild
    const originalRemoveChild = document.body.removeChild;
    document.body.removeChild = vi.fn((child) => {
      return originalRemoveChild.call(document.body, child);
    });

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
    
    // Mock className manipulation
    document.body.classList.add = vi.fn();
    document.body.classList.remove = vi.fn();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should throw an error when used outside a provider', () => {
    render(<ErrorComponent />);
    expect(screen.getByTestId('error')).toHaveTextContent('useDragContext must be used within a DragProvider');
  });
  
  it('should provide the initial drag state', () => {
    render(
      <DragProvider>
        <TestComponent />
      </DragProvider>
    );
    
    const dragStateEl = screen.getByTestId('drag-state');
    const dragState = JSON.parse(dragStateEl.textContent || '{}');
    
    expect(dragState.isDragging).toBe(false);
    expect(dragState.startPosition).toBeNull();
    expect(dragState.currentPosition).toBeNull();
    expect(dragState.draggedItem).toBeNull();
    expect(dragState.draggedId).toBeNull();
    expect(dragState.sourceContainerId).toBeNull();
    expect(dragState.targetContainerId).toBeNull();
  });
  
  it('should start dragging when startDrag is called', async () => {
    render(
      <DragProvider>
        <TestComponent />
      </DragProvider>
    );
    
    const startDragBtn = screen.getByTestId('start-drag-btn');
    
    // Mock the MouseEvent
    Object.defineProperty(startDragBtn, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 50,
        width: 100,
        height: 50,
        x: 0,
        y: 0,
      }),
      configurable: true,
    });
    
    fireEvent.click(startDragBtn, {
      clientX: 50,
      clientY: 25,
    });
    
    // Wait for state update
    await waitFor(() => {
      const dragStateEl = screen.getByTestId('drag-state');
      const dragState = JSON.parse(dragStateEl.textContent || '{}');
      expect(dragState.isDragging).toBe(true);
    });
    
    // Check if body class was added
    expect(document.body.classList.add).toHaveBeenCalledWith('dragging');
  });
  
  it('should cancel dragging when cancelDrag is called', async () => {
    render(
      <DragProvider>
        <TestComponent />
      </DragProvider>
    );
    
    // Start dragging
    const startDragBtn = screen.getByTestId('start-drag-btn');
    fireEvent.click(startDragBtn, {
      clientX: 50,
      clientY: 25,
    });
    
    // Wait for drag to start
    await waitFor(() => {
      const dragStateEl = screen.getByTestId('drag-state');
      const dragState = JSON.parse(dragStateEl.textContent || '{}');
      expect(dragState.isDragging).toBe(true);
    });
    
    // Cancel drag
    const cancelDragBtn = screen.getByTestId('cancel-drag-btn');
    fireEvent.click(cancelDragBtn);
    
    // Wait for state update
    await waitFor(() => {
      const dragStateEl = screen.getByTestId('drag-state');
      const dragState = JSON.parse(dragStateEl.textContent || '{}');
      expect(dragState.isDragging).toBe(false);
    });
    
    // Check if body class was removed
    expect(document.body.classList.remove).toHaveBeenCalledWith('dragging');
  });
  
  it('should set target container when setTargetContainer is called', async () => {
    render(
      <DragProvider>
        <TestComponent />
      </DragProvider>
    );
    
    // Start dragging
    const startDragBtn = screen.getByTestId('start-drag-btn');
    fireEvent.click(startDragBtn, {
      clientX: 50,
      clientY: 25,
    });
    
    // Wait for drag to start
    await waitFor(() => {
      const dragStateEl = screen.getByTestId('drag-state');
      const dragState = JSON.parse(dragStateEl.textContent || '{}');
      expect(dragState.isDragging).toBe(true);
    });
    
    // Set target container
    const setTargetBtn = screen.getByTestId('set-target-btn');
    fireEvent.click(setTargetBtn);
    
    // Wait for state update
    await waitFor(() => {
      const dragStateEl = screen.getByTestId('drag-state');
      const dragState = JSON.parse(dragStateEl.textContent || '{}');
      expect(dragState.targetContainerId).toBe('container-2');
    });
  });
}); 