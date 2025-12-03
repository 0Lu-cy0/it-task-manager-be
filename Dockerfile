# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install all dependencies (including dev) for local/docker testing
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Default environment for container testing
ENV APP_HOST=0.0.0.0
ENV APP_PORT=3000
ENV BUILD_MODE=production

EXPOSE 3000

# Build the application
RUN npm run build

# Start production server using built code
CMD ["node", "./build/src/server.js"]
