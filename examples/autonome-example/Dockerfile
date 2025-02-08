# Builder stage
FROM node:22-slim AS builder

# Install pnpm and build dependencies in one layer to minimize space usage
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm@latest && \
    npm cache clean --force

# Set the working directory
WORKDIR /app

# Copy package files and tsconfig
COPY package.json tsconfig.json ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile && \
    pnpm store prune

# Copy source code
COPY src ./src

# Build the application
RUN pnpm build

# Final runtime image
FROM node:22-slim

# Install pnpm and clean up in one layer
RUN npm install -g pnpm@latest && \
    npm cache clean --force

# Set the working directory
WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Expose the chatbot port
EXPOSE 3001

# Create an entrypoint script
COPY <<-"EOF" /usr/local/bin/docker-entrypoint.sh
#!/bin/sh
set -e
exec pnpm start
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"] 