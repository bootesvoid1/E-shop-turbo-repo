# STAGE 1: Build the NestJS app
FROM node:22 as builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Run unit tests
RUN npm test

# STAGE 2: Create lightweight production image
FROM node:22-alpine

WORKDIR /app

# Only necessary runtime dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./.env

# Expose the port your app listens on
EXPOSE 3001

# Start the app
CMD ["node", "dist/main"]