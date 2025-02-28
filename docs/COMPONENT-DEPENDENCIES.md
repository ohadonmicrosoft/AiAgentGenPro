# Component Dependencies and Relationships

## Overview

This document outlines the dependencies and relationships between components in the AI Agent Generator application. Understanding these relationships is crucial for maintaining the codebase and implementing new features.

## Core Component Hierarchy

```
App
├── Providers (ThemeProvider, QueryClientProvider, AuthProvider)
├── Router
│   ├── PublicRoutes
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   └── LandingPage
│   └── ProtectedRoutes
│       ├── MainLayout
│       │   ├── Sidebar
│       │   ├── TopNav
│       │   └── Content Area
│       │       ├── DashboardPage
│       │       ├── AgentsPage
│       │       ├── AgentWizard
│       │       ├── SettingsPage
│       │       └── ProfilePage
│       └── MobileLayout
│           ├── MobileNav
│           └── Content Area
```

## Component Dependencies

### Authentication Components

- **LoginForm** → AuthContext → Firebase Auth
- **RegisterForm** → AuthContext → Firebase Auth
- **ProtectedRoute** → AuthContext
- **UserProfile** → AuthContext, UserContext

### Agent Creation Components

- **AgentWizard** → AgentContext, FormContext
- **AgentBasicInfo** → FormContext, ValidationSchemas
- **AgentConfiguration** → FormContext, ValidationSchemas, OpenAIContext
- **AgentPrompt** → FormContext, ValidationSchemas, OpenAIContext
- **AgentReview** → FormContext, AgentContext, API Services

### UI Components

- **Sidebar** → AuthContext, NavigationContext, ThemeContext
- **TopNav** → AuthContext, NotificationContext, ThemeContext
- **Button** → ThemeContext
- **Input** → FormContext, ThemeContext
- **Modal** → ThemeContext, ModalContext
- **Toast** → ToastContext, ThemeContext

## Context Providers and Their Consumers

### AuthContext

**Providers:**
- AuthProvider (wraps the entire application)

**Consumers:**
- ProtectedRoute
- Sidebar
- TopNav
- UserProfile
- AgentsPage
- SettingsPage

### ThemeContext

**Providers:**
- ThemeProvider (wraps the entire application)

**Consumers:**
- All UI components
- MainLayout
- MobileLayout

### FormContext

**Providers:**
- FormProvider (wraps form components)

**Consumers:**
- Input
- Select
- Checkbox
- RadioGroup
- AgentWizard steps

### AgentContext

**Providers:**
- AgentProvider (wraps agent-related pages)

**Consumers:**
- AgentWizard
- AgentsPage
- AgentDetail

### NavigationContext

**Providers:**
- NavigationProvider (wraps layouts)

**Consumers:**
- Sidebar
- MobileNav
- Breadcrumbs

## Hook Dependencies

- **useAuth** → AuthContext
- **useTheme** → ThemeContext
- **useForm** → FormContext
- **useAgent** → AgentContext
- **useNavigation** → NavigationContext
- **useIsMobile** → Viewport information
- **useLocalStorage** → Browser localStorage
- **useQueryClient** → React Query

## Component Reuse Patterns

### High Reuse Components

These components are used throughout the application and have minimal dependencies:

- Button
- Input
- Card
- Modal
- Toast
- Dropdown
- Tabs
- Toggle

### Medium Reuse Components

These components are reused in specific sections and have moderate dependencies:

- FormField (combines Label, Input, and Error)
- NavItem (used in Sidebar and MobileNav)
- AgentCard (used in AgentsPage and Dashboard)
- StepIndicator (used in wizards)
- SearchBar (used in list pages)

### Low Reuse Components

These components are specific to certain features and have many dependencies:

- AgentWizard steps
- UserProfileForm
- APIKeyManager
- IntegrationConnector

## Data Flow Between Components

### Form Data Flow

```
FormProvider
├── Form Component
│   ├── Input → onChange → FormState
│   ├── Select → onChange → FormState
│   ├── Validation → errors → ErrorDisplay
│   └── Submit → onSubmit → API Call
```

### Authentication Data Flow

```
AuthProvider
├── Login/Register Form → submitCredentials → Firebase/Auth Service
├── Auth Service → user data → AuthContext.user
└── Components → useAuth() → Access user data and auth methods
```

### Agent Data Flow

```
AgentProvider
├── AgentWizard → createAgent → API Service
├── API Service → agent data → AgentContext.agents
└── Components → useAgent() → Access agent data and methods
```

## Component Lifecycle Dependencies

### Initialization Dependencies

- **App** must initialize providers before rendering routes
- **AuthProvider** must initialize before protected routes
- **QueryClientProvider** must initialize before data fetching components
- **ThemeProvider** must initialize before UI components

### Cleanup Dependencies

- **AuthProvider** must handle cleanup of auth listeners
- **WebSocketProvider** must close connections on unmount
- **FormProvider** must reset form state on unmount

## Circular Dependencies to Avoid

- AuthContext ↔ UserContext (potential circular dependency)
- AgentContext ↔ FormContext (potential circular dependency)
- NavigationContext ↔ RouterContext (potential circular dependency)

## Recommended Component Refactoring

1. **Split Sidebar.tsx** into smaller components:
   - SidebarContainer
   - SidebarNavigation
   - SidebarFooter
   - SidebarNavItem

2. **Extract form logic** from AgentWizard steps into custom hooks:
   - useAgentBasicInfoForm
   - useAgentConfigurationForm
   - useAgentPromptForm

3. **Create composition patterns** for commonly used component combinations:
   - FormFieldWithValidation
   - CardWithHeader
   - ModalWithActions 