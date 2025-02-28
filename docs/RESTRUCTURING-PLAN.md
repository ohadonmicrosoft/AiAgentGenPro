# Project Restructuring Plan

## Overview

This document outlines a comprehensive plan to reorganize the AI Agent Generator project for improved maintainability, clearer component relationships, and better separation of concerns.

## Current Structure Issues

Based on our deep inspection, the current project structure has the following issues:

1. Duplicated and conflicting context directories (`context` and `contexts`)
2. Multiple test directories scattered across the project
3. Unclear separation between server and client code
4. Inconsistent file naming conventions
5. Linting errors and warnings
6. Redundant imports and unused code

## Proposed Directory Structure

```
ai-agent-generator/
├── client/                    # Frontend code
│   ├── public/                # Static assets
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── assets/            # Images, fonts, etc.
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── wizard/        # Agent creation wizard
│   │   │   ├── mobile/        # Mobile-specific components
│   │   │   └── forms/         # Form-related components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── animations/    # Animation-related hooks
│   │   ├── layouts/           # Page layout components
│   │   ├── lib/               # Utility/helper functions
│   │   ├── pages/             # Page components
│   │   ├── providers/         # Provider components
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Main App component
│   │   ├── index.css          # Global styles
│   │   ├── main.tsx           # Entry point
│   │   ├── constants.ts       # Application constants
│   │   └── service-worker.ts  # Service worker for PWA
│   ├── index.html             # HTML entry point
│   └── tsconfig.json          # TypeScript configuration for client
│
├── server/                    # Backend code
│   ├── api/                   # API endpoints
│   ├── lib/                   # Server utilities
│   ├── middlewares/           # Express middlewares
│   ├── migrations/            # Database migrations
│   ├── models/                # Data models
│   ├── routes/                # Route definitions
│   ├── services/              # Business logic services
│   │   ├── openai.ts          # OpenAI integration
│   │   ├── storage.ts         # Storage service
│   │   └── slack.ts           # Slack integration
│   ├── config/                # Server configuration
│   └── index.ts               # Server entry point
│
├── shared/                    # Shared between client and server
│   └── schema.ts              # Shared data schemas/types
│
├── functions/                 # Firebase Cloud Functions
│   ├── src/                   # Functions source code
│   └── lib/                   # Compiled functions
│
├── config/                    # Project configuration files
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   └── jest.config.js         # Jest configuration
│
├── scripts/                   # Utility scripts
│
├── tests/                     # Integration and E2E tests
│
├── docs/                      # Documentation
│
├── firebase/                  # Firebase-specific files
│   ├── firestore.rules
│   ├── storage.rules
│   └── firebase.json
│
├── .github/                   # GitHub workflow configurations
├── .husky/                    # Git hooks
├── package.json               # Project dependencies
└── tsconfig.json              # TypeScript configuration
```

## File Reorganization Map

### Client Files

| Current Location                          | New Location                                  | Notes                         |
| ----------------------------------------- | --------------------------------------------- | ----------------------------- |
| client/src/App.tsx                        | client/src/App.tsx                            | No change                     |
| client/src/main.tsx                       | client/src/main.tsx                           | No change                     |
| client/src/index.css                      | client/src/index.css                          | No change                     |
| client/src/constants.ts                   | client/src/constants.ts                       | No change                     |
| client/src/service-worker.ts              | client/src/service-worker.ts                  | No change                     |
| client/src/service-worker-registration.ts | client/src/lib/service-worker-registration.ts | Move to lib                   |
| client/src/components/\*.tsx              | client/src/components/                        | No change                     |
| client/src/components/ui/\*.tsx           | client/src/components/ui/                     | No change                     |
| client/src/components/auth/\*.tsx         | client/src/components/auth/                   | No change                     |
| client/src/components/wizard/\*.tsx       | client/src/components/wizard/                 | No change                     |
| client/src/components/mobile/\*.tsx       | client/src/components/mobile/                 | No change                     |
| client/src/contexts/\*.tsx                | client/src/contexts/                          | Consolidate all contexts here |
| client/src/context/\*.tsx                 | client/src/contexts/                          | Move files to contexts/       |
| client/src/hooks/\*.ts                    | client/src/hooks/                             | No change                     |
| client/src/hooks/\*.tsx                   | client/src/hooks/                             | No change                     |
| client/src/hooks/animations/\*.ts         | client/src/hooks/animations/                  | No change                     |
| client/src/lib/\*.ts                      | client/src/lib/                               | No change                     |
| client/src/lib/\*.tsx                     | client/src/lib/                               | No change                     |
| client/src/layouts/\*.tsx                 | client/src/layouts/                           | No change                     |
| client/src/pages/\*.tsx                   | client/src/pages/                             | No change                     |
| client/src/providers/\*.tsx               | client/src/providers/                         | No change                     |
| client/src/types/\*.ts                    | client/src/types/                             | No change                     |
| client/src/types.ts                       | client/src/types/index.ts                     | Move to types directory       |

### Server Files

| Current Location        | New Location                | Notes                         |
| ----------------------- | --------------------------- | ----------------------------- |
| server/index.ts         | server/index.ts             | No change                     |
| server/vite.ts          | server/config/vite.ts       | Move to config directory      |
| server/db.ts            | server/models/db.ts         | Move to models directory      |
| server/auth.ts          | server/services/auth.ts     | Move to services directory    |
| server/openai.ts        | server/services/openai.ts   | Move to services directory    |
| server/storage.ts       | server/services/storage.ts  | Move to services directory    |
| server/slack.ts         | server/services/slack.ts    | Move to services directory    |
| server/middleware.ts    | server/middlewares/index.ts | Move to middlewares directory |
| server/routes.ts        | server/routes/index.ts      | Move to routes directory      |
| server/api/\*.ts        | server/api/                 | No change                     |
| server/lib/\*.ts        | server/lib/                 | No change                     |
| server/migrations/\*.ts | server/migrations/          | No change                     |

### Shared Files

| Current Location | New Location     | Notes     |
| ---------------- | ---------------- | --------- |
| shared/schema.ts | shared/schema.ts | No change |

### Configuration Files

| Current Location | New Location          | Notes                    |
| ---------------- | --------------------- | ------------------------ |
| tsconfig.json    | tsconfig.json         | No change                |
| .eslintrc.json   | config/.eslintrc.json | Move to config directory |
| .eslintignore    | config/.eslintignore  | Move to config directory |
| config/\*.js     | config/               | No change                |
| config/\*.ts     | config/               | No change                |
| config/\*.json   | config/               | No change                |

## Common Linting Issues to Address

1. Unused imports in components
2. Undefined variables in components
3. Inconsistent file naming (some use kebab-case, others use PascalCase)
4. Missing TypeScript types

## Implementation Strategy

1. First, fix all linting errors in the current structure to ensure code quality
2. Second, gradually migrate files to the new structure, starting with the most independent modules
3. Update import paths as files are moved
4. Verify that the application still works after each migration step

## Benefits of Restructuring

1. Improved code organization and maintainability
2. Clearer separation of concerns
3. Better developer experience with intuitive file locations
4. Reduced redundancy
5. Easier onboarding for new developers
