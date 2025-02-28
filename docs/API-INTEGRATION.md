# API Integration Approach

## Overview

This document outlines the API integration approach in the AI Agent Generator application, detailing how the frontend communicates with backend services and external APIs.

## API Architecture

The application uses a multi-layered API architecture:

1. **Internal API Layer**: Custom backend API endpoints
2. **External API Integration**: OpenAI, Firebase, and other third-party services
3. **API Client Layer**: Frontend service modules that abstract API calls
4. **React Query Layer**: Data fetching, caching, and state management

## Internal API Structure

### API Routes

The backend API is organized into the following route groups:

```
/api
├── /auth
│   ├── GET /me - Get current user
│   ├── POST /login - User login
│   ├── POST /register - User registration
│   └── POST /logout - User logout
├── /agents
│   ├── GET / - List all agents
│   ├── GET /:id - Get agent by ID
│   ├── POST / - Create new agent
│   ├── PUT /:id - Update agent
│   └── DELETE /:id - Delete agent
├── /integrations
│   ├── GET / - List all integrations
│   ├── POST /slack - Connect Slack
│   ├── POST /discord - Connect Discord
│   └── DELETE /:type - Remove integration
├── /settings
│   ├── GET / - Get user settings
│   └── PUT / - Update user settings
└── /openai
    ├── POST /complete - Text completion
    ├── POST /chat - Chat completion
    └── POST /embed - Text embedding
```

### API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "error": null,
  "meta": {
    "timestamp": "2023-06-15T12:34:56Z",
    "requestId": "req_123456"
  }
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "error message"
    }
  },
  "meta": {
    "timestamp": "2023-06-15T12:34:56Z",
    "requestId": "req_123456"
  }
}
```

## API Client Implementation

### Base API Client

The application uses a base API client that handles common functionality:

```typescript
// client/src/lib/api/apiClient.ts
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers["Authorization"];
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT, DELETE methods...

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseData = await response.json();

    if (!response.ok) {
      // Handle error responses
      throw new ApiError(
        responseData.error.message,
        responseData.error.code,
        responseData.error.details,
      );
    }

    return responseData;
  }
}

export const apiClient = new ApiClient(process.env.REACT_APP_API_URL || "/api");
```

### Feature-Specific API Services

Each feature has its own API service that extends the base client:

```typescript
// client/src/lib/api/agentService.ts
import { apiClient } from "./apiClient";
import type { Agent, AgentCreateInput, AgentUpdateInput } from "../../types";

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await apiClient.get<Agent[]>("/agents");
    return response.data;
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`/agents/${id}`);
    return response.data;
  },

  async createAgent(data: AgentCreateInput): Promise<Agent> {
    const response = await apiClient.post<Agent>("/agents", data);
    return response.data;
  },

  async updateAgent(id: string, data: AgentUpdateInput): Promise<Agent> {
    const response = await apiClient.put<Agent>(`/agents/${id}`, data);
    return response.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/agents/${id}`);
  },
};
```

## React Query Integration

The application uses React Query to manage server state:

```typescript
// client/src/hooks/useAgents.ts
import { useQuery, useMutation, useQueryClient } from "react-query";
import { agentService } from "../lib/api/agentService";
import type { Agent, AgentCreateInput, AgentUpdateInput } from "../types";

export function useAgents() {
  return useQuery<Agent[], Error>("agents", agentService.getAgents);
}

export function useAgent(id: string) {
  return useQuery<Agent, Error>(
    ["agent", id],
    () => agentService.getAgent(id),
    {
      enabled: !!id,
    },
  );
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, AgentCreateInput>(
    (data) => agentService.createAgent(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("agents");
      },
    },
  );
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, { id: string; data: AgentUpdateInput }>(
    ({ id, data }) => agentService.updateAgent(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("agents");
        queryClient.invalidateQueries(["agent", data.id]);
      },
    },
  );
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    (id) => agentService.deleteAgent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("agents");
      },
    },
  );
}
```

## External API Integrations

### OpenAI Integration

```typescript
// server/services/openai.ts
import { Configuration, OpenAIApi } from "openai";
import { config } from "../config";

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
});

const openai = new OpenAIApi(configuration);

export async function generateAgentPrompt(
  description: string,
  context: string,
) {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps create effective prompts for AI agents.",
      },
      {
        role: "user",
        content: `Create a prompt for an AI agent with the following description: ${description}. The agent will operate in this context: ${context}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.data.choices[0]?.message?.content || "";
}

// Other OpenAI functions...
```

### Firebase Integration

```typescript
// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const firebaseAuth = {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  async logout() {
    return signOut(auth);
  },
};
```

## API Error Handling

### Error Types

```typescript
// client/src/lib/api/errors.ts
export class ApiError extends Error {
  code: string;
  details?: Record<string, string>;

  constructor(message: string, code: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(
    message = "Authentication required",
    details?: Record<string, string>,
  ) {
    super(message, "AUTHENTICATION_REQUIRED", details);
    this.name = "AuthenticationError";
  }
}
```

### Global Error Handling

```typescript
// client/src/lib/api/errorHandler.ts
import { ApiError, AuthenticationError } from "./errors";
import { toast } from "../toast";
import { authService } from "./authService";

export function setupGlobalErrorHandler() {
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (error instanceof ApiError) {
      handleApiError(error);
    } else {
      // Handle other errors
      toast.error("An unexpected error occurred");
      console.error("Unhandled error:", error);
    }
  });
}

function handleApiError(error: ApiError) {
  if (error instanceof AuthenticationError) {
    // Handle authentication errors
    authService.logout();
    toast.error("Your session has expired. Please log in again.");
  } else if (error.code === "VALIDATION_ERROR") {
    // Handle validation errors
    toast.error("Please check your input and try again");
  } else {
    // Handle other API errors
    toast.error(error.message || "An error occurred");
  }
}
```

## API Testing

### Mock Service Worker Setup

```typescript
// client/src/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  rest.get("/api/agents", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: "1",
            name: "Customer Support Agent",
            description: "Handles customer inquiries",
            // Other fields...
          },
          // More agents...
        ],
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: "test-req-1",
        },
      }),
    );
  }),

  // More handlers...
];
```

### API Service Tests

```typescript
// client/src/lib/api/__tests__/agentService.test.ts
import { agentService } from "../agentService";
import { apiClient } from "../apiClient";
import { mockAgent } from "../../mocks/data";

// Mock the apiClient
jest.mock("../apiClient");

describe("agentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAgents", () => {
    it("should fetch agents successfully", async () => {
      const mockResponse = { data: [mockAgent] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await agentService.getAgents();

      expect(apiClient.get).toHaveBeenCalledWith("/agents");
      expect(result).toEqual([mockAgent]);
    });
  });

  // More tests...
});
```

## API Documentation

The API is documented using OpenAPI (Swagger) specification:

```yaml
# server/openapi.yaml
openapi: 3.0.0
info:
  title: AI Agent Generator API
  version: 1.0.0
  description: API for creating and managing AI agents
paths:
  /api/agents:
    get:
      summary: List all agents
      responses:
        "200":
          description: List of agents
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Agent"
                  error:
                    type: null
    # More paths...
components:
  schemas:
    Agent:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        # More properties...
      required:
        - id
        - name
    # More schemas...
```

## API Security

### Authentication

The API uses JWT for authentication:

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UserService } from "../services/userService";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await UserService.getUserById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
}
```

### Rate Limiting

```typescript
// server/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts, please try again later",
    },
  },
});
```

## Recommended API Improvements

1. **Implement GraphQL**

   - Add GraphQL layer for more flexible data fetching
   - Reduce over-fetching and under-fetching

2. **Add API Versioning**

   - Implement versioned API endpoints (e.g., `/api/v1/agents`)
   - Create a strategy for API evolution and backward compatibility

3. **Enhance Error Handling**

   - Implement more granular error codes
   - Add request ID tracking for better debugging

4. **Improve Performance**

   - Add response compression
   - Implement proper caching headers
   - Consider edge caching for frequently accessed data

5. **Enhance Security**
   - Add CSRF protection
   - Implement API key management for external integrations
   - Add request signing for sensitive operations
