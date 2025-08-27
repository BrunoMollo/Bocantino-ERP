# Multi-stage build for SvelteKit application

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent && npm cache clean --force

# Set build-time environment variables as safe placeholders
ENV NEON_DATABASE_URL="postgresql://build:build@localhost:5432/build_placeholder"
ENV NODE_ENV="production"
ENV JWT_SECRET_KEY="build-time-placeholder-key-not-for-production-use-only-32chars"
ENV JWT_EXPIRES_IN="60"
ENV PORT="3000"
ENV HOST="0.0.0.0"

# Copy source code
COPY . .

# Create .env file for build with safe placeholders
RUN echo "NEON_DATABASE_URL=postgresql://build:build@localhost:5432/build_placeholder" > .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "JWT_SECRET_KEY=build-time-placeholder-key-not-for-production-use-only-32chars" >> .env && \
    echo "JWT_EXPIRES_IN=60" >> .env && \
    echo "PORT=3000" >> .env && \
    echo "HOST=0.0.0.0" >> .env

# Build the application with placeholder environment variables
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sveltekit -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package*.json ./
COPY --from=builder --chown=sveltekit:nodejs /app/drizzle.config.ts ./
COPY --from=builder --chown=sveltekit:nodejs /app/migrations ./migrations

# Copy entrypoint script and make it executable
COPY --chown=sveltekit:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "build"]
