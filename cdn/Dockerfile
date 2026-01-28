FROM node:20-slim

WORKDIR /app

# Install dotenvx globally
RUN npm install -g @dotenvx/dotenvx

# Copy package files
COPY ./package.json /app/

# Install dependencies
RUN npm i

# Copy source and build
COPY ./tsconfig.json /app/
COPY ./src/ /app/src/
RUN npm install -D typescript @types/node && \
    npm run build && \
    npm prune --production

# Copy web assets
COPY web /app/web

# Create cdn directory
RUN mkdir -p cdn

# Expose port
EXPOSE 8080

# Run with dotenvx
CMD ["dotenvx", "run", "--", "node", "dist/server.js"]