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

# Install MeiliSearch
RUN apk add --no-cache curl && \
    curl -L https://install.meilisearch.com | sh && \
    mv ./meilisearch /usr/local/bin/ && \
    apk del curl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/build ./build

# Copy necessary files
COPY start-meili.js ./
COPY scripts ./scripts

# Create directory for MeiliSearch data
RUN mkdir -p /app/data.ms

# Expose ports
EXPOSE 3000 7700

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start both MeiliSearch and the app
CMD sh -c "meilisearch --db-path=/app/data.ms --http-addr=0.0.0.0:7700 --master-key=${MEILISEARCH_API_KEY} & node ./build/src/server.js"
