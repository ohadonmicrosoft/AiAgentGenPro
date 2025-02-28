# Testing Strategy

## Overview

This document outlines the testing strategy for the AI Agent Generator application, detailing the different types of tests, testing tools, and best practices to ensure code quality and reliability.

## Testing Pyramid

The application follows a testing pyramid approach:

```
    ▲
   ╱ ╲    E2E Tests (Few)
  ╱───╲
 ╱     ╲   Integration Tests (Some)
╱       ╲
─────────   Unit Tests (Many)
```

1. **Unit Tests**: Test individual functions, components, and modules in isolation
2. **Integration Tests**: Test interactions between components and modules
3. **End-to-End Tests**: Test complete user flows and scenarios

## Unit Testing

### Component Testing

```typescript
// client/src/components/ui/Button/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('btn-secondary');
  });
});
```

### Hook Testing

```typescript
// client/src/hooks/__tests__/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../useAuth';
import { firebaseAuth } from '../../lib/firebase';

// Mock firebase auth
jest.mock('../../lib/firebase', () => ({
  firebaseAuth: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication state and methods', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
  });

  it('calls firebase login method with correct credentials', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    const credentials = { email: 'test@example.com', password: 'password123' };
    
    await act(async () => {
      await result.current.login(credentials);
    });

    expect(firebaseAuth.login).toHaveBeenCalledWith(
      credentials.email,
      credentials.password
    );
  });

  // More tests...
});
```

### Utility Function Testing

```typescript
// client/src/utils/__tests__/formatters.test.ts
import { formatDate, formatCurrency, truncateText } from '../formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-01-15T12:30:00Z');
      expect(formatDate(date)).toBe('Jan 15, 2023');
    });

    it('handles different format options', () => {
      const date = new Date('2023-01-15T12:30:00Z');
      expect(formatDate(date, { month: 'long' })).toBe('January 15, 2023');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });
  });

  describe('truncateText', () => {
    it('truncates text to specified length', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
    });

    it('does not truncate text shorter than limit', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });
});
```

## Integration Testing

### API Service Testing

```typescript
// client/src/lib/api/__tests__/agentService.integration.test.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { agentService } from '../agentService';

const server = setupServer(
  rest.get('/api/agents', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: '1', name: 'Test Agent 1' },
          { id: '2', name: 'Test Agent 2' },
        ],
        error: null,
      })
    );
  }),
  
  rest.get('/api/agents/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        success: true,
        data: { id, name: `Test Agent ${id}` },
        error: null,
      })
    );
  }),
  
  // More handlers...
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('agentService integration', () => {
  it('fetches agents successfully', async () => {
    const agents = await agentService.getAgents();
    expect(agents).toHaveLength(2);
    expect(agents[0].name).toBe('Test Agent 1');
  });

  it('fetches a single agent by ID', async () => {
    const agent = await agentService.getAgent('1');
    expect(agent.id).toBe('1');
    expect(agent.name).toBe('Test Agent 1');
  });

  // More tests...
});
```

### Form Integration Testing

```typescript
// client/src/components/forms/__tests__/AgentForm.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { AgentForm } from '../AgentForm';
import { agentService } from '../../../lib/api/agentService';

// Mock the agent service
jest.mock('../../../lib/api/agentService', () => ({
  createAgent: jest.fn(),
  updateAgent: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AgentForm integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits form data correctly for new agent', async () => {
    (agentService.createAgent as jest.Mock).mockResolvedValue({
      id: 'new-id',
      name: 'New Agent',
      description: 'Test description',
    });

    const onSuccess = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AgentForm onSuccess={onSuccess} />
      </QueryClientProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New Agent' },
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // Wait for the submission to complete
    await waitFor(() => {
      expect(agentService.createAgent).toHaveBeenCalledWith({
        name: 'New Agent',
        description: 'Test description',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  // More tests...
});
```

### Context Integration Testing

```typescript
// client/src/contexts/__tests__/AuthContext.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { firebaseAuth } from '../../lib/firebase';

// Mock component that uses the auth context
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-email">{user.email}</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
          Login
        </button>
      )}
    </div>
  );
};

// Mock firebase auth
jest.mock('../../lib/firebase', () => ({
  firebaseAuth: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

describe('AuthContext integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates user state after successful login', async () => {
    // Mock successful login
    (firebaseAuth.login as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', uid: '123' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByText('Login'));

    // Wait for user state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  // More tests...
});
```

## End-to-End Testing

### User Flow Testing

```typescript
// e2e/tests/agent-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a new agent', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to agent creation
  await page.click('text=Create Agent');
  
  // Fill out the form
  await page.fill('input[name="name"]', 'E2E Test Agent');
  await page.fill('textarea[name="description"]', 'This is a test agent created by E2E tests');
  await page.selectOption('select[name="category"]', 'customer-support');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  
  // Configure agent
  await page.fill('textarea[name="prompt"]', 'You are a helpful assistant...');
  await page.click('input[name="useOpenAI"]');
  
  // Complete creation
  await page.click('button:has-text("Create Agent")');
  
  // Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page.locator('h1')).toContainText('E2E Test Agent');
});
```

### Authentication Testing

```typescript
// e2e/tests/authentication.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;
  const password = 'securePassword123';
  
  // Register
  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);
  
  // Logout
  await page.click('button:has-text("Logout")');
  
  // Login with new credentials
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Verify successful login
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Welcome back')).toBeVisible();
});
```

### Responsive Design Testing

```typescript
// e2e/tests/responsive.spec.ts
import { test, expect } from '@playwright/test';

test.describe('responsive design', () => {
  test('desktop layout', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    await page.goto('/');
    
    // Verify desktop layout elements
    await expect(page.locator('nav.sidebar')).toBeVisible();
    await expect(page.locator('header.top-nav')).toBeVisible();
    await expect(page.locator('button.mobile-menu')).not.toBeVisible();
  });
  
  test('mobile layout', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile layout elements
    await expect(page.locator('nav.sidebar')).not.toBeVisible();
    await expect(page.locator('button.mobile-menu')).toBeVisible();
    
    // Open mobile menu
    await page.click('button.mobile-menu');
    
    // Verify mobile menu is visible
    await expect(page.locator('nav.mobile-nav')).toBeVisible();
  });
});
```

## Testing Tools and Libraries

### Unit and Integration Testing

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Testing Library User Event**: Simulating user interactions
- **Jest Axe**: Accessibility testing

### End-to-End Testing

- **Playwright**: Browser automation and E2E testing
- **Playwright Test**: Test runner for Playwright
- **Faker.js**: Generating test data

### Visual Regression Testing

- **Storybook**: Component development and documentation
- **Chromatic**: Visual regression testing for Storybook

### Performance Testing

- **Lighthouse**: Performance, accessibility, and SEO auditing
- **WebPageTest**: Advanced performance testing

## Test Coverage

The project aims for the following test coverage targets:

- **Unit Tests**: 80% coverage of all utility functions and hooks
- **Component Tests**: 70% coverage of all UI components
- **Integration Tests**: Key user flows and API interactions
- **E2E Tests**: Critical user journeys and business processes

### Coverage Reporting

Jest is configured to generate coverage reports:

```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  // Other configuration...
};
```

## Testing Best Practices

### Component Testing

1. **Test behavior, not implementation**
   - Focus on what the component does, not how it does it
   - Avoid testing implementation details

2. **Use user-centric queries**
   - Prefer `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`
   - Test from the user's perspective

3. **Test accessibility**
   - Include accessibility checks in component tests
   - Use jest-axe for automated accessibility testing

### API Testing

1. **Mock external dependencies**
   - Use MSW to mock API responses
   - Test both success and error scenarios

2. **Test error handling**
   - Verify that errors are handled gracefully
   - Test different error types and status codes

3. **Test edge cases**
   - Empty responses
   - Large data sets
   - Malformed responses

### End-to-End Testing

1. **Focus on critical paths**
   - Identify and test the most important user journeys
   - Don't try to test everything with E2E tests

2. **Use realistic test data**
   - Create test data that resembles real user data
   - Consider using factories or fixtures for consistent test data

3. **Test across browsers**
   - Configure Playwright to test in multiple browsers
   - Focus on browsers with significant user share

## Continuous Integration

The project uses GitHub Actions for continuous integration:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Unit and integration tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Environment Setup

### Jest Setup

```typescript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
};
```

### Playwright Setup

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e/tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  ],
};

export default config;
```

## Recommended Testing Improvements

1. **Implement Visual Regression Testing**
   - Set up Storybook for component documentation
   - Integrate Chromatic for visual regression testing
   - Create stories for all key components

2. **Enhance E2E Test Coverage**
   - Add more comprehensive E2E tests for critical flows
   - Implement user journey testing
   - Add performance testing in the E2E pipeline

3. **Improve Test Data Management**
   - Create factories for generating test data
   - Implement database seeding for E2E tests
   - Use consistent test data across all test types

4. **Add Contract Testing**
   - Implement contract tests between frontend and backend
   - Use tools like Pact for consumer-driven contract testing
   - Ensure API changes don't break existing consumers

5. **Implement Accessibility Testing**
   - Add automated accessibility tests
   - Include manual accessibility testing in the QA process
   - Create accessibility testing guidelines 