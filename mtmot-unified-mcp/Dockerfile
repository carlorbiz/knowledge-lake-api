FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy source files
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start HTTP server
CMD ["node", "dist/http-server.js"]
