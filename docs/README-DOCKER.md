# Docker Setup Guide

This is a quick-start guide for using Docker with the AI Agent Generator application. For more detailed information, please refer to the [Docker Configuration Guide](./docs/DOCKER-GUIDE.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

## Quick Start

### Development Environment

Run the development environment with hot-reloading and Firebase emulators:

```bash
# Navigate to the project directory
cd project-restructure

# Start the development environment
./scripts/deploy.sh development

# Or use Docker Compose directly
docker-compose up
```

The development environment will be available at:
- Client App: http://localhost:3000
- Server API: http://localhost:5000
- Firebase Emulator UI: http://localhost:4000

### Staging Environment

Deploy to the staging environment with monitoring:

```bash
# Generate SSL certificates for staging (first time only)
./scripts/generate-certs.sh staging

# Start the staging environment
./scripts/deploy.sh staging

# Or use Docker Compose directly
docker-compose -f docker-compose.prod.yml -f docker-compose.staging.yml up -d
```

The staging environment will be available at:
- Web Application: http://localhost:8080
- HTTPS Application: https://localhost:8443 (using self-signed certificates)
- Monitoring Dashboard: http://localhost:9090

### Production Environment

Deploy to the production environment:

```bash
# Generate SSL certificates for production (first time only)
./scripts/generate-certs.sh production your-domain.com

# Start the production environment
./scripts/deploy.sh production

# Or use Docker Compose directly
docker-compose -f docker-compose.prod.yml up -d
```

The production application will be available at:
- HTTPS Application: https://your-domain.com (requires proper SSL certificates)

## Container Management

### Viewing Logs

```bash
# View logs for all containers
docker-compose logs

# View logs for a specific service
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f
```

### Stopping Containers

```bash
# Stop containers but preserve data
docker-compose down

# Stop containers and remove volumes (clears all data)
docker-compose down -v
```

### Rebuilding after Changes

```bash
# Rebuild and restart containers
docker-compose up --build

# Rebuild a specific service
docker-compose up --build app
```

## Environment Variables

Environment variables can be set in various ways:

1. Through `.env.development`, `.env.staging`, or `.env.production` files
2. Directly in the docker-compose files
3. Passed on the command line when starting Docker Compose

Example `.env.development` file:

```
NODE_ENV=development
CLIENT_PORT=3000
SERVER_PORT=5000
FIREBASE_PROJECT_ID=dev-project
ENABLE_API_DEBUGGING=true
```

## Volumes and Persistence

The following volumes are used for data persistence:

- `redis-data`: Redis data
- `firebase-data`: Firebase emulator data
- `static-content`: Static website content
- `prometheus-data`: Monitoring data (staging only)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite) 