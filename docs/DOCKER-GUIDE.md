# Docker Configuration Guide

This document provides comprehensive information about the Docker configuration for the AI Agent Generator application, including development workflows, production deployment, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Production Deployment](#production-deployment)
4. [Firebase Emulator](#firebase-emulator)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Overview

The application uses Docker and Docker Compose to create consistent, reproducible environments for development, testing, and production. The following Docker configurations are available:

- **Dockerfile**: Production image for the main application
- **Dockerfile.dev**: Development image with hot-reloading and development tools
- **Dockerfile.firebase**: Configuration for Firebase emulator services
- **docker-compose.yml**: Development environment with all required services
- **docker-compose.prod.yml**: Production environment configuration

## Development Environment

The development environment is configured to provide:

- Hot-reloading for both client and server code
- Firebase emulators for all Firebase services
- Redis for caching and session management
- Proper volume mapping for efficient development

### Starting the Development Environment

```bash
# Basic startup
npm run docker:dev

# Or use the deployment script
./scripts/deploy.sh development
```

### Development Container Details

The development container:

1. Uses Node.js 16 Alpine as the base image
2. Installs necessary build tools (python3, make, g++, git)
3. Maps your local codebase to the container
4. Exposes ports for both client (3000) and server (5000)
5. Automatically restarts when code changes using nodemon

### Environment Variables

Development environment variables are loaded from `.env.development` if available, or can be set directly in the docker-compose.yml file:

```yaml
environment:
  - NODE_ENV=development
  - CLIENT_PORT=3000
  - SERVER_PORT=5000
  - REDIS_URL=redis://redis:6379
  - USE_MOCK_STORAGE=true
```

## Production Deployment

The production setup is designed for scalability, security, and performance:

- Multi-container deployment with Docker Compose
- Nginx as a reverse proxy and static file server
- Redis for caching and session management
- Proper security headers and SSL configuration
- Support for replicated services and load balancing

### Deploying to Production

```bash
# Using the deployment script (recommended)
./scripts/deploy.sh production

# Or manually
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Production Dockerfile Details

The production Dockerfile uses a multi-stage build process:

1. **Build Stage**:
   - Builds the application from source
   - Compiles TypeScript
   - Creates optimized production assets

2. **Production Stage**:
   - Uses a minimal Node.js Alpine image
   - Includes only production dependencies
   - Runs with a non-root user for security
   - Contains metadata labels for auditing and tracking

### Nginx Configuration

The production environment uses Nginx for:

- Serving static assets with proper caching
- Reverse proxying API requests to the Node.js server
- Handling HTTPS with SSL termination
- Implementing security headers
- Basic rate limiting
- HTTP to HTTPS redirection

## Firebase Emulator

The Firebase emulator configuration allows development without connecting to production Firebase services:

- Emulates Firestore, Auth, Storage, and Functions
- Persists data between restarts (using volumes)
- Provides a UI for monitoring and managing emulated services

### Accessing the Firebase Emulator UI

When running the development environment, access the Firebase Emulator UI at:
http://localhost:4000

### Available Emulated Services

| Service     | Port  | Description                        |
|-------------|-------|------------------------------------|
| Firestore   | 8080  | NoSQL document database            |
| Auth        | 9099  | Authentication service             |
| Storage     | 9199  | File storage                       |
| Functions   | 5001  | Serverless functions               |
| Emulator UI | 4000  | Dashboard for all emulated services|

## Best Practices

### Environment-Specific Configurations

Create separate environment files for different deployment targets:

- `.env.development` for local development
- `.env.staging` for staging environment
- `.env.production` for production environment

### Docker Image Optimization

1. Use multi-stage builds to keep images small
2. Leverage Docker layer caching by organizing Dockerfiles efficiently
3. Specify exact versions for all base images and dependencies
4. Use Alpine-based images when possible
5. Include only necessary files in the build context

### Security Considerations

1. Run containers as non-root users
2. Use read-only file systems when possible
3. Implement proper secrets management (avoid putting secrets in Docker images)
4. Scan images for vulnerabilities before deployment
5. Apply security updates regularly

### Performance Optimization

1. Use volume mapping for development to avoid rebuilding
2. Leverage Redis for caching and session storage
3. Configure Nginx for optimal static file serving
4. Use appropriate container resource limits
5. Implement proper health checks

## Troubleshooting

### Common Issues

#### Container fails to start

Check logs for errors:
```bash
docker-compose logs app
```

#### Port conflicts

If ports are already in use on your host machine, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Map container port 3000 to host port 3001
```

#### Node modules issues

If you encounter node_modules permission issues:
```bash
# Rebuild the node_modules inside the container
docker-compose down
docker-compose up --build
```

#### Redis connection issues

Ensure Redis service is running:
```bash
docker-compose ps redis
```

Check Redis logs:
```bash
docker-compose logs redis
```

### Getting Help

If you encounter issues not covered here:

1. Check Docker and Docker Compose documentation
2. Review the error logs for specific error messages
3. Search the project repository issues
4. Reach out to the development team for support 