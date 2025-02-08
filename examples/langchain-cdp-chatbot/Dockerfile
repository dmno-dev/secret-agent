FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/
COPY .dmno/ ./.dmno/

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

# Expose the required port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 