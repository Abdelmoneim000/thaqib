# build and run both front-end and server

# Stage 1: Build the frontend
FROM node:22-alpine AS frontend
WORKDIR /app/client
COPY client/package*.json .
RUN npm install
COPY client .
RUN npm run build

# Stage 2: Build the server
FROM node:22-alpine AS server
WORKDIR /app/server
COPY server/package*.json .
RUN npm install
COPY server .

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

# Copy built frontend
COPY --from=frontend /app/client/dist ./client

# Copy server
COPY --from=server /app/server ./server

# Create a non-root user
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/index.cjs"]