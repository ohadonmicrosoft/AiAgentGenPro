import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '../test/utils';
import { GlobalStateProvider, useGlobalState, GlobalStateError } from './global-state-context';
import type { Notification } from './global-state-context';

// Mock component that uses the global state context
const TestComponent: React.FC = () => {
  const {
    state,
    setTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearAllNotifications,
    setCurrentWorkspace,
  } = useGlobalState();

  return (
    <div>
      <div data-testid="theme">{state.theme}</div>
      <div data-testid="sidebar-status">
        {state.sidebarExpanded ? 'expanded' : 'collapsed'}
      </div>
      <div data-testid="notifications-count">
        {state.notifications.length}
      </div>
      <div data-testid="workspace-id">
        {state.currentWorkspaceId || 'no-workspace'}
      </div>
      <div data-testid="online-status">
        {state.isOnline ? 'online' : 'offline'}
      </div>
      <div data-testid="loading-status">
        {state.isAppLoading ? 'loading' : 'not-loading'}
      </div>
      
      <button
        data-testid="set-theme-light"
        onClick={() => setTheme('light')}
      >
        Set Light Theme
      </button>
      <button
        data-testid="toggle-sidebar"
        onClick={() => toggleSidebar()}
      >
        Toggle Sidebar
      </button>
      <button
        data-testid="add-notification"
        onClick={() => 
          addNotification({
            type: 'info',
            message: 'Test notification',
            title: 'Test',
          })
        }
      >
        Add Notification
      </button>
      <button
        data-testid="clear-notifications"
        onClick={() => clearAllNotifications()}
      >
        Clear Notifications
      </button>
      <button
        data-testid="set-workspace"
        onClick={() => setCurrentWorkspace('workspace-1')}
      >
        Set Workspace
      </button>
      
      <ul data-testid="notifications-list">
        {state.notifications.map((notification) => (
          <li key={notification.id} data-testid={`notification-${notification.id}`}>
            <span>{notification.title}: {notification.message}</span>
            <button
              data-testid={`remove-notification-${notification.id}`}
              onClick={() => removeNotification(notification.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Mock component that throws an error
const ErrorComponent: React.FC = () => {
  try {
    useGlobalState();
    return <div>This should not render</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
};

describe('GlobalStateContext', () => {
  // Mock online/offline events
  beforeEach(() => {
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  it('should throw an error when used outside a provider', () => {
    render(<ErrorComponent />);
    expect(screen.getByTestId('error')).toHaveTextContent('useGlobalState must be used within a GlobalStateProvider');
  });
  
  it('should provide the initial global state', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('sidebar-status')).toHaveTextContent('expanded');
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('workspace-id')).toHaveTextContent('no-workspace');
    expect(screen.getByTestId('online-status')).toHaveTextContent('online');
    expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
  });
  
  it('should update the theme when setTheme is called', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    fireEvent.click(screen.getByTestId('set-theme-light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });
  
  it('should toggle the sidebar when toggleSidebar is called', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(screen.getByTestId('sidebar-status')).toHaveTextContent('expanded');
    fireEvent.click(screen.getByTestId('toggle-sidebar'));
    expect(screen.getByTestId('sidebar-status')).toHaveTextContent('collapsed');
    fireEvent.click(screen.getByTestId('toggle-sidebar'));
    expect(screen.getByTestId('sidebar-status')).toHaveTextContent('expanded');
  });
  
  it('should add a notification when addNotification is called', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    
    // Check notification content
    const notificationElement = screen.getByText('Test: Test notification');
    expect(notificationElement).toBeInTheDocument();
  });
  
  it('should remove a notification when removeNotification is called', async () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    
    // Get the remove button for the notification
    const removeButton = await screen.findByTestId(/remove-notification-/);
    fireEvent.click(removeButton);
    
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
  });
  
  it('should clear all notifications when clearAllNotifications is called', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    // Add multiple notifications
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');
    
    // Clear all notifications
    fireEvent.click(screen.getByTestId('clear-notifications'));
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
  });
  
  it('should set the current workspace when setCurrentWorkspace is called', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(screen.getByTestId('workspace-id')).toHaveTextContent('no-workspace');
    fireEvent.click(screen.getByTestId('set-workspace'));
    expect(screen.getByTestId('workspace-id')).toHaveTextContent('workspace-1');
  });
  
  it('should auto-close notifications after duration', async () => {
    // Mock setTimeout and clearTimeout
    vi.useFakeTimers();
    
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Check that the notification was removed
    await waitFor(() => {
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });
    
    // Restore timers
    vi.useRealTimers();
  });
  
  it('should update online status based on window events', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(screen.getByTestId('online-status')).toHaveTextContent('online');
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByTestId('online-status')).toHaveTextContent('offline');
    
    // Simulate going back online
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });
    
    expect(screen.getByTestId('online-status')).toHaveTextContent('online');
  });
  
  it('should set up and clean up event listeners for online status', () => {
    const { unmount } = render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
}); 