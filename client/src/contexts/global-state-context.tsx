import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppError } from '../lib/error-handling';

/**
 * Error class for global state operations
 */
export class GlobalStateError extends AppError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'GlobalStateError';
  }
}

/**
 * Application state interface
 */
export interface GlobalState {
  theme: 'light' | 'dark' | 'system';
  sidebarExpanded: boolean;
  notifications: Notification[];
  currentWorkspaceId: string | null;
  isOnline: boolean;
  lastSyncTime: number | null;
  isAppLoading: boolean;
}

/**
 * Notification interface for the global notification system
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
  createdAt: number;
  isRead: boolean;
}

/**
 * Initial global state
 */
const initialState: GlobalState = {
  theme: 'system',
  sidebarExpanded: true,
  notifications: [],
  currentWorkspaceId: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncTime: null,
  isAppLoading: false,
};

/**
 * Action types for the global state reducer
 */
type GlobalStateAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_EXPANDED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: string | null }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC_TIME'; payload: number }
  | { type: 'SET_APP_LOADING'; payload: boolean };

/**
 * Reducer function for global state management
 */
function globalStateReducer(state: GlobalState, action: GlobalStateAction): GlobalState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarExpanded: !state.sidebarExpanded,
      };
    case 'SET_SIDEBAR_EXPANDED':
      return {
        ...state,
        sidebarExpanded: action.payload,
      };
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        isRead: false,
        autoClose: true,
        duration: 5000,
        ...action.payload,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50 notifications
      };
    }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    case 'SET_CURRENT_WORKSPACE':
      return {
        ...state,
        currentWorkspaceId: action.payload,
      };
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };
    case 'SET_LAST_SYNC_TIME':
      return {
        ...state,
        lastSyncTime: action.payload,
      };
    case 'SET_APP_LOADING':
      return {
        ...state,
        isAppLoading: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Context interface for global state
 */
interface GlobalStateContextValue {
  state: GlobalState;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => string;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setAppLoading: (isLoading: boolean) => void;
}

// Create context
const GlobalStateContext = createContext<GlobalStateContextValue | undefined>(undefined);

/**
 * Provider component for global state
 * 
 * @example
 * ```tsx
 * <GlobalStateProvider>
 *   <App />
 * </GlobalStateProvider>
 * ```
 */
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  // Action creators
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarExpanded = useCallback((expanded: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: expanded });
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  const setCurrentWorkspace = useCallback((workspaceId: string | null) => {
    dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspaceId });
  }, []);

  const setOnlineStatus = useCallback((isOnline: boolean) => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
  }, []);

  const setLastSyncTime = useCallback((time: number) => {
    dispatch({ type: 'SET_LAST_SYNC_TIME', payload: time });
  }, []);

  const setAppLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_APP_LOADING', payload: isLoading });
  }, []);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Notification auto-close handler
  React.useEffect(() => {
    const autoCloseNotifications = state.notifications.filter(
      (n) => n.autoClose && !n.isRead
    );

    if (autoCloseNotifications.length === 0) return;

    const timers = autoCloseNotifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 5000);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [state.notifications, removeNotification]);

  const contextValue: GlobalStateContextValue = {
    state,
    setTheme,
    toggleSidebar,
    setSidebarExpanded,
    addNotification,
    removeNotification,
    markNotificationRead,
    clearAllNotifications,
    setCurrentWorkspace,
    setOnlineStatus,
    setLastSyncTime,
    setAppLoading,
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
}

/**
 * Hook to use the global state context
 * 
 * @returns The global state context value
 * @throws {GlobalStateError} If used outside of a GlobalStateProvider
 * 
 * @example
 * ```tsx
 * const { state, addNotification, toggleSidebar } = useGlobalState();
 * 
 * // Access state
 * const { theme, notifications } = state;
 * 
 * // Use actions
 * const handleSuccess = () => {
 *   addNotification({
 *     type: 'success',
 *     message: 'Operation completed successfully',
 *     title: 'Success'
 *   });
 * };
 * ```
 */
export function useGlobalState() {
  const context = useContext(GlobalStateContext);

  if (context === undefined) {
    throw new GlobalStateError(
      'useGlobalState must be used within a GlobalStateProvider',
      'CONTEXT_OUTSIDE_PROVIDER'
    );
  }

  return context;
} 