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

# The 'node' user with ID 1000 already exists in the base image, so we don't need to create it.
# We will use the existing 'node' user.

# Copy only the necessary files for production
# Set ownership of the working directory to the 'node' user
RUN chown node:node /app

# Switch to non-root user 'node' immediately
USER node

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install ONLY production dependencies (as the node user)
RUN npm install --production

# Copy the build output with correct ownership
COPY --chown=node:node --from=builder /app/dist ./dist

# No need for recursive chown as everything is already owned by node

# Expose the port (Replit/Express usually defaults to 3000 or 5000)
EXPOSE 5000

# Start the application using your defined start script
CMD ["npm", "start"]