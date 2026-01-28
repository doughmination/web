FROM node:20-slim

WORKDIR /app

# Install dotenvx globally
RUN npm install -g @dotenvx/dotenvx

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Copy web assets
COPY web ./web

# Create cdn directory
RUN mkdir -p cdn

# Expose port
EXPOSE 8080

# Run with dotenvx
CMD ["dotenvx", "run", "--", "node", "dist/server.js"]