#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default environment
ENV=${1:-development}

echo -e "${GREEN}Deploying to Firebase (${ENV} environment)...${NC}"

# Build the application
echo -e "${GREEN}Building application...${NC}"
NODE_ENV=$ENV node scripts/build.js

# Make sure the client build output is in the correct location for Firebase hosting
echo -e "${GREEN}Ensuring client build is in the correct location...${NC}"
mkdir -p dist/client
cp -r client/dist/* dist/client/ 2>/dev/null || true

# Copy Firebase configuration files to root for deployment
echo -e "${GREEN}Copying Firebase configuration files for deployment...${NC}"

cp firebase/firestore.rules ./firestore.rules 2>/dev/null || echo -e "${YELLOW}Warning: Could not copy firestore.rules${NC}"
cp firebase/storage.rules ./storage.rules 2>/dev/null || echo -e "${YELLOW}Warning: Could not copy storage.rules${NC}"
cp firebase/firestore.indexes.json ./firestore.indexes.json 2>/dev/null || echo -e "${YELLOW}Warning: Could not copy firestore.indexes.json${NC}"
cp firebase/firebase.json ./firebase.json 2>/dev/null || echo -e "${YELLOW}Warning: Could not copy firebase.json${NC}"

# Deploy to Firebase
echo -e "${GREEN}Deploying to Firebase...${NC}"
firebase use $ENV
firebase deploy --only hosting,firestore,storage,functions

# Clean up temporary files
echo -e "${GREEN}Cleaning up...${NC}"
rm -f ./firestore.rules ./storage.rules ./firestore.indexes.json ./firebase.json

echo -e "${GREEN}Firebase deployment completed!${NC}" 