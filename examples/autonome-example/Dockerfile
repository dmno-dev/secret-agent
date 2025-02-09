# Use Alpine-based Node.js image for smaller size and better stability
FROM node:20-alpine AS builder

# Install pnpm and build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base && \
    npm install -g pnpm@9.15.4 && \
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
FROM node:20-alpine

# Install pnpm and runtime dependencies
RUN apk add --no-cache \
    python3 && \
    npm install -g pnpm@9.15.4 && \
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

# Command to start the application
CMD ["pnpm", "start"] 