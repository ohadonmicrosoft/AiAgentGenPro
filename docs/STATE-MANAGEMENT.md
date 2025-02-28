# State Management Approach

## Overview

This document outlines the state management approach in the AI Agent Generator application, detailing how different types of state are handled across the application.

## State Management Layers

The application uses a multi-layered approach to state management:

1. **Local Component State**: For UI-specific state that doesn't need to be shared
2. **Context API**: For shared state within specific feature areas
3. **React Query**: For server state and data fetching
4. **Local Storage/Cookies**: For persisted state across sessions

## Local Component State

### When to Use

- Component-specific UI states (open/closed, active tab, etc.)
- Form input values before submission
- Temporary data that doesn't need to be shared

### Implementation

```tsx
// Example of local component state
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Current Usage

- Modal open/close states
- Form field values
- Accordion expand/collapse states
- Tab selection
- Pagination state

## Context API

### When to Use

- User authentication state
- Theme preferences
- Feature-specific shared state
- Application-wide UI state

### Implementation

```tsx
// Example of Context API usage
// AuthContext.tsx
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Authentication logic...
  
  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage in components
function UserProfile() {
  const { user } = useAuth(); // Custom hook that uses AuthContext
  
  return <div>Hello, {user?.name}</div>;
}
```

### Current Contexts

1. **AuthContext**
   - User authentication state
   - Login/logout methods
   - User profile information

2. **ThemeContext**
   - Light/dark mode preference
   - Theme customization options
   - Color scheme settings

3. **AgentContext**
   - Agent creation/editing state
   - Agent list and selection
   - Agent operations (create, update, delete)

4. **NavigationContext**
   - Current route information
   - Navigation history
   - Breadcrumb data

5. **NotificationContext**
   - Toast notifications
   - System alerts
   - Status messages

## React Query

### When to Use

- Server data fetching and caching
- Mutations (create, update, delete operations)
- Polling and real-time updates
- Pagination and infinite scrolling

### Implementation

```tsx
// Example of React Query usage
function AgentsList() {
  const { data, isLoading, error } = useQuery('agents', fetchAgents);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {data.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

// Mutation example
function CreateAgentForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation(createAgent, {
    onSuccess: () => {
      queryClient.invalidateQueries('agents');
    },
  });
  
  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
  
  // Form implementation...
}
```

### Current Query Keys

- `agents` - List of all agents
- `agent-[id]` - Specific agent details
- `user-profile` - Current user profile
- `settings` - User settings
- `integrations` - Connected integrations

## Local Storage / Cookies

### When to Use

- User preferences that persist across sessions
- Authentication tokens
- Recently viewed items
- Form drafts for recovery

### Implementation

```tsx
// Example of Local Storage usage with a custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Usage
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Current Stored Items

- `auth-token` - JWT for authentication
- `theme-preference` - User's preferred theme
- `recent-agents` - Recently viewed agents
- `wizard-draft` - Draft state of the agent wizard
- `sidebar-collapsed` - Sidebar collapse state

## State Management Decision Tree

When adding a new feature, use this decision tree to determine the appropriate state management approach:

1. **Is the state specific to a single component with no need to share?**
   - Yes → Use local component state (useState/useReducer)
   - No → Continue to next question

2. **Is the state related to server data?**
   - Yes → Use React Query
   - No → Continue to next question

3. **Does the state need to be shared across multiple components?**
   - Yes → Use Context API
   - No → Continue to next question

4. **Does the state need to persist across sessions?**
   - Yes → Use Local Storage/Cookies
   - No → Reconsider using local component state

## State Management Anti-Patterns to Avoid

1. **Prop Drilling**
   - Passing props through multiple levels of components
   - Solution: Use Context API for deeply shared state

2. **Context Overuse**
   - Creating contexts for every small piece of shared state
   - Solution: Combine related state in a single context

3. **Redundant State**
   - Duplicating state that already exists elsewhere
   - Solution: Identify a single source of truth

4. **Over-Fetching**
   - Fetching the same data multiple times
   - Solution: Use React Query for caching and deduplication

5. **Global State Overuse**
   - Putting everything in global state
   - Solution: Keep state as local as possible

## Recommended State Management Improvements

1. **Consolidate Related Contexts**
   - Combine UI-related contexts (modal, toast, drawer) into a single UIContext
   - Merge user-related contexts (auth, preferences) into a UserContext

2. **Implement State Machines for Complex Flows**
   - Use XState for the agent creation wizard
   - Implement state machines for authentication flows

3. **Optimize React Query Usage**
   - Implement optimistic updates for better UX
   - Use prefetching for anticipated data needs
   - Configure proper stale times and caching strategies

4. **Add State Persistence Layer**
   - Implement a consistent approach to state persistence
   - Create a wrapper for Local Storage with type safety
   - Add migration strategies for stored data structure changes 