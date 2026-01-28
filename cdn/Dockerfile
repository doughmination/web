FROM node:20-slim

WORKDIR /app

# Install dotenvx globally
RUN npm install -g @dotenvx/dotenvx

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm install -D typescript @types/node && \
    npm run build && \
    npm prune --production

# Copy web assets
COPY web ./web

# Create cdn directory
RUN mkdir -p cdn

# Expose port
EXPOSE 8080

# Run with dotenvx
CMD ["dotenvx", "run", "--", "node", "dist/server.js"]