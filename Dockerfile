# Stage 1: Install dependencies
FROM node:20-alpine AS installer

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --prefer offline --no-audit

# Stage 2: Build application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency lock file and install production deps only
COPY --from=installer /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy application source files
COPY . .

# Install build dependencies and build
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Install production dependencies only
RUN npm install --omit dev --no-audit

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Start the application
CMD ["npm", "start"]
