# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy the root package files
COPY package*.json ./

# Install dependencies (including devDependencies needed for the build script)
RUN npm install

# Copy the ENTIRE project (client, server, script, shared, etc.)
COPY . .

# Run the build script from the ROOT
# This executes "tsx script/build.ts" which handles the rest
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Copy only the necessary files for production
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --production

# Copy the build output
# Based on your "start" script ("node dist/index.cjs"), your build output goes to /dist
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Expose the port (Replit/Express usually defaults to 3000 or 5000)
EXPOSE 3000

# Start the application using your defined start script
CMD ["npm", "start"]