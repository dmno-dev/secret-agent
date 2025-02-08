# Use Node.js as base image
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy package files for the monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/secretagent-lib/package.json ./packages/secretagent-lib/
COPY examples/langchain-cdp-chatbot/package.json ./examples/langchain-cdp-chatbot/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the monorepo
COPY . .

# Build the secretagent-lib package first
RUN pnpm --filter secretagent.sh build

# Build the chatbot example
RUN pnpm --filter @coinbase/cdp-langchain-chatbot-example build

# Expose the required port
EXPOSE 3001

# Set the working directory to the chatbot example
WORKDIR /app/examples/langchain-cdp-chatbot

# Start the application
CMD ["pnpm", "start"] 