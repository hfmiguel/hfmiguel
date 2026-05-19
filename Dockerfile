# Stage 1: Install dependencies
FROM node:20-alpine

WORKDIR /var/www/

# Copy package files
COPY app /var/www/app
COPY lib /var/www/lib
COPY package.json /var/www/package.json
COPY package-lock.json /var/www/package-lock.json
COPY public /var/www/public
COPY tsconfig.json /var/www/tsconfig.json
COPY next.config.mjs /var/www/next.config.mjs
COPY next-env.d.ts /var/www/next-env.d.ts
COPY README.md /var/www/README.md

# Install dependencies
RUN npm ci

RUN npm cache clean --force && npm run build

# Create app user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Expose port 3000
EXPOSE 3101
ENV PORT=3000
ENV NODE_ENV=production

RUN chown -R nextjs:nodejs /var/www/

# Switch to non-root user
USER nextjs

# Start the application
CMD ["npm", "run", "dev"]
