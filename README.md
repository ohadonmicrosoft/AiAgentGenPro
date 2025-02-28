# AI Agent Generator Project Documentation

## Overview

This directory contains comprehensive documentation for the AI Agent Generator project, outlining the architecture, structure, and best practices for development, testing, and deployment.

## Table of Contents

1. [Restructuring Plan](./RESTRUCTURING-PLAN.md) - Detailed plan for reorganizing the project structure
2. [Data Flow](./DATA-FLOW.md) - Documentation of data flow and component integration
3. [Component Dependencies](./COMPONENT-DEPENDENCIES.md) - Analysis of component relationships and dependencies
4. [State Management](./STATE-MANAGEMENT.md) - Approach to state management across the application
5. [API Integration](./API-INTEGRATION.md) - Strategy for API integration and communication
6. [Testing Strategy](./TESTING-STRATEGY.md) - Comprehensive testing approach and best practices
7. [Deployment Strategy](./DEPLOYMENT-STRATEGY.md) - Infrastructure and deployment workflow

## Project Summary

The AI Agent Generator is a web application that allows users to create, configure, and deploy AI agents for various use cases. The application consists of a React-based frontend and a Node.js backend, with integration to external services like OpenAI and Firebase.

### Key Features

- User authentication and authorization
- AI agent creation and configuration
- Agent deployment and management
- Integration with external platforms
- Analytics and performance monitoring

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **AI Integration**: OpenAI API
- **Deployment**: Docker, Kubernetes, Google Cloud Platform

### Project Structure

The project is organized into the following directories:

- `/client` - Frontend React application
- `/server` - Backend Node.js application
- `/functions` - Firebase Cloud Functions
- `/config` - Configuration files (ESLint, PostCSS, Tailwind, Vitest)
- `/firebase` - Firebase configuration files
- `/docker` - Docker configuration files
- `/scripts` - Build and deployment scripts
- `/docs` - Project documentation
- `/shared` - Shared code between client and server
- `/monitoring` - Monitoring and analytics configuration
- `/nginx` - Nginx configuration for production

Configuration files in the root directory are symbolic links to their actual locations in the respective directories, which helps keep the root directory clean while maintaining compatibility with tools that expect configuration files in the root.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see [Deployment Strategy](./DEPLOYMENT-STRATEGY.md))
4. Start the development server with `npm run dev`

## Development Workflow

1. Create a feature branch from `develop`
2. Implement changes following the architecture guidelines
3. Write tests for new functionality
4. Submit a pull request for review
5. After approval, merge into `develop`
6. Periodically, `develop` is merged into `main` for production releases

## Contributing

When contributing to this project, please follow these guidelines:

1. Follow the code style and organization outlined in the documentation
2. Write tests for all new features and bug fixes
3. Update documentation when making significant changes
4. Use meaningful commit messages and PR descriptions

## Contact

For questions or support, contact the project maintainers:

- Project Lead: [project-lead@example.com](mailto:project-lead@example.com)
- Technical Lead: [tech-lead@example.com](mailto:tech-lead@example.com) 