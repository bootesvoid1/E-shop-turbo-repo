# STAGE 1: Build the user microservice with pnpm + turborepo
FROM node:22 as builder

WORKDIR /app

# Copy root files needed for install
COPY turbo.json ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install global tools
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build only the user app and its dependencies
RUN pnpm turbo run build --filter=user

# STAGE 2: Runtime image (lightweight)
FROM node:22-alpine

WORKDIR /app

# Copy built dist and runtime deps
COPY --from=builder /app/dist/apps/user ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./.env

# Expose port
EXPOSE 3002

# Start the app
CMD ["node", "dist/main"]