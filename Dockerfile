# Build stage
FROM node:16-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files and build
COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Add build info
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/your-org/ai-agent-generator" \
      org.label-schema.version=$VERSION \
      org.label-schema.name="AI Agent Generator" \
      org.label-schema.description="AI Agent Generator application" \
      org.label-schema.schema-version="1.0"

# Expose the server port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Use a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs
USER nodejs

# Command to run the application
CMD ["node", "dist/server/index.js"]