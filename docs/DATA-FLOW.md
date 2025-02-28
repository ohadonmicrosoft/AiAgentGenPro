# Application Data Flow

## Overview

This document outlines the data flow in the AI Agent Generator application, showing how different components interact and how data moves through the system.

## Authentication Flow

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ Auth Pages  │──────► Auth Contexts  │──────► Auth Services  │
│ - Login     │◄─────┤ - User State   │◄─────┤ - Firebase Auth│
│ - Register  │      │ - Auth Methods │      │ - Custom Auth  │
└─────────────┘      └───────────────┘      └────────────────┘
                            │                        │
                            ▼                        ▼
                     ┌──────────────┐      ┌──────────────────┐
                     │ Protected    │      │ Backend API      │
                     │ Routes       │──────► - Session Mgmt   │
                     └──────────────┘      │ - User Validation│
                                           └──────────────────┘
```

### Key Components:

1. **Authentication Pages**: 
   - `auth.tsx` and `auth-page.tsx` handle user login/registration UI
   - Form validation using React Hook Form and Zod

2. **Authentication Contexts**:
   - `AuthContext.tsx` - Firebase authentication
   - `ServerAuthContext.tsx` - Custom server authentication
   - Stores user state and provides authentication methods

3. **Authentication Services**:
   - `auth-service.ts` handles Firebase authentication calls
   - Server-side `auth.ts` handles session management

4. **Protected Routes**:
   - `ProtectedRoute.tsx` ensures only authenticated users access certain pages
   - Redirects unauthenticated users to login

## Agent Creation Flow

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ Agent Wizard│──────► Agent State   │──────► API Services   │
│ Screens     │◄─────┤ Management    │◄─────┤                │
└─────────────┘      └───────────────┘      └────────────────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ Form        │      │ Validation    │      │ OpenAI Service │
│ Components  │──────► (Zod Schemas) │──────► - Agent Creation│
└─────────────┘      └───────────────┘      └────────────────┘
```

### Key Components:

1. **Agent Wizard**:
   - `AgentWizard.tsx` - Main container for the agent creation flow
   - Step components: `AgentBasicInfo.tsx`, `AgentConfiguration.tsx`, `AgentPrompt.tsx`, `AgentReview.tsx`

2. **State Management**:
   - Uses React Query for server state
   - Uses React's useState/useReducer for wizard state

3. **API Services**:
   - Communicates with backend API endpoints in `server/api/`
   - Handles creating and updating agents

4. **OpenAI Integration**:
   - `server/openai.ts` handles communication with OpenAI
   - Processes agent configurations to create effective AI agents

## Main UI Data Flow

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ App.tsx     │──────► MainLayout    │──────► Page Components│
│             │      │ - Structure   │      │                │
└─────────────┘      └───────────────┘      └────────────────┘
                            │                        │
                            ▼                        ▼
                     ┌──────────────┐      ┌──────────────────┐
                     │ Sidebar      │      │ Components       │
                     │ & Navigation │      │ (UI Building Blocks)│
                     └──────────────┘      └──────────────────┘
```

### Key Components:

1. **App.tsx**:
   - Root component that sets up routing and providers

2. **MainLayout.tsx**:
   - Provides the structural layout for all pages
   - Includes Sidebar, TopNav, and content area

3. **Page Components**:
   - Located in `client/src/pages/`
   - Each represents a different view in the application

4. **Sidebar & Navigation**:
   - `Sidebar.tsx` contains the main navigation links
   - Uses the `useAuth` hook to display user-specific navigation

5. **UI Components**:
   - Located in `client/src/components/ui/`
   - Reusable, atomic UI components used throughout the application

## Data Storage and Backend Flow

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ React Query │──────► Server Routes │──────► Database Access│
│ Client      │◄─────┤ & Controllers │◄─────┤ (Drizzle ORM)  │
└─────────────┘      └───────────────┘      └────────────────┘
                            │                        │
                            ▼                        ▼
                     ┌──────────────┐      ┌──────────────────┐
                     │ Firebase     │      │ External Services│
                     │ Integration  │      │ (OpenAI, Slack)  │
                     └──────────────┘      └──────────────────┘
```

### Key Components:

1. **React Query Client**:
   - Defined in `client/src/lib/queryClient.ts`
   - Handles data fetching, caching, and synchronization

2. **Server Routes & Controllers**:
   - Defined in `server/routes.ts` and `server/api/`
   - Handle HTTP requests and business logic

3. **Database Access**:
   - Uses Drizzle ORM in `server/db.ts`
   - Provides type-safe database operations

4. **Firebase Integration**:
   - Authentication and storage integration
   - Firestore for some data storage

5. **External Services**:
   - OpenAI for AI agent functionality
   - Slack for notifications and integrations

## Form Handling and Validation

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ React Hook  │──────► Zod Schema    │──────► Form Components│
│ Form        │◄─────┤ Validation    │◄─────┤                │
└─────────────┘      └───────────────┘      └────────────────┘
```

### Key Components:

1. **React Hook Form**:
   - Used throughout the application for form handling
   - Provides form state, validation, and submission handling

2. **Zod Schema Validation**:
   - Defined in various files and in `shared/schema.ts`
   - Provides type-safe validation for forms and API data

3. **Form Components**:
   - Form UI components with built-in validation
   - Error handling and feedback

## Service Worker and Offline Support

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│ Service     │──────► Offline Cache │──────► Offline Forms  │
│ Worker      │◄─────┤               │◄─────┤ & Sync         │
└─────────────┘      └───────────────┘      └────────────────┘
```

### Key Components:

1. **Service Worker**:
   - Defined in `client/src/service-worker.ts`
   - Handles caching and offline access

2. **Offline Cache**:
   - Caches assets and API responses
   - Provides offline functionality

3. **Offline Forms & Sync**:
   - Allows users to submit forms offline
   - Syncs when connection is restored 