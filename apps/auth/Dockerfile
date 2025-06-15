# STAGE 1: Build the NestJS app (using pnpm and Turborepo)
FROM node:22 as builder

WORKDIR /app

# Copy workspace files first to leverage caching
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install root dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build only the auth service and its dependencies
RUN pnpm turbo run build --filter=auth

# Optional: Run tests if needed in CI
# RUN pnpm turbo run test --filter=auth

# STAGE 2: Create lightweight production image
FROM node:22-alpine

WORKDIR /app

# Copy built output from builder stage
COPY --from=builder /app/dist/apps/auth ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy environment file (if exists)
COPY --from=builder /app/auth/.env.local ./.env

# Expose the port your app listens on
EXPOSE 3001

# Start the app
CMD ["node", "dist/main"]