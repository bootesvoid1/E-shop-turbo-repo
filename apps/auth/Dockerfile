# STAGE 1: Build the NestJS app (using pnpm and Turborepo)
FROM node:22.9.0 AS builder
WORKDIR /app
# Copy workspace files for caching
COPY pnpm-lock.yaml package.json turbo.json ./
# Install pnpm globally
RUN npm install -g pnpm
# Install root dependencies
RUN pnpm install --frozen-lockfile
# Copy source code
COPY apps/auth ./apps/auth
# Build only the auth service
RUN pnpm turbo run build --filter=auth
# Optional: Run tests in CI
# RUN pnpm turbo run test --filter=auth

# STAGE 2: Create lightweight production image
FROM node:22.9.0-alpine
WORKDIR /app
# Copy built output and dependencies
COPY --from=builder /app/dist/apps/auth ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./  # For npm scripts, if needed
# Set production environment
ENV NODE_ENV=production
# Run as non-root user
USER node
# Expose port
EXPOSE 3001
# Start the app
CMD ["node", "dist/main"]