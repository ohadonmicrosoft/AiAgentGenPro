#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default environment
ENV=${1:-production}

# Print banner
echo -e "${GREEN}"
echo "================================================="
echo "   Application Deployment Script"
echo "   Environment: ${ENV}"
echo "================================================="
echo -e "${NC}"

# Validate environment
if [[ ! "$ENV" =~ ^(development|staging|production)$ ]]; then
  echo -e "${RED}Error: Invalid environment. Must be 'development', 'staging', or 'production'.${NC}"
  exit 1
fi

# Load environment variables
if [ -f ".env.${ENV}" ]; then
  echo -e "${GREEN}Loading environment variables from .env.${ENV}${NC}"
  export $(grep -v '^#' .env.${ENV} | xargs)
else
  echo -e "${YELLOW}Warning: No .env.${ENV} file found. Using system environment variables.${NC}"
fi

# Build and deploy based on environment
case $ENV in
  development)
    echo -e "${GREEN}Starting development environment...${NC}"
    docker-compose -f docker-compose.yml up --build
    ;;
    
  staging)
    echo -e "${GREEN}Deploying to staging environment...${NC}"
    docker-compose -f docker-compose.prod.yml -f docker-compose.staging.yml build
    docker-compose -f docker-compose.prod.yml -f docker-compose.staging.yml up -d
    ;;
    
  production)
    echo -e "${GREEN}Deploying to production environment...${NC}"
    
    # Build images
    echo -e "${GREEN}Building Docker images...${NC}"
    docker-compose -f docker-compose.prod.yml build
    
    # Run database migrations if needed
    echo -e "${GREEN}Running database migrations...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm app npm run db:migrate
    
    # Start or update services
    echo -e "${GREEN}Starting services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d
    
    # Check service health
    echo -e "${GREEN}Checking service health...${NC}"
    sleep 10
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Exit"; then
      echo -e "${RED}Error: Some services failed to start. Check logs for details.${NC}"
      docker-compose -f docker-compose.prod.yml logs
      exit 1
    fi
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    ;;
esac