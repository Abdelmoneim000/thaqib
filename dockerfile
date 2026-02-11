# Stage 1: Build the frontend
FROM node:22-alpine AS frontend
WORKDIR /app/client
# COPY the ROOT package.json to the current directory
COPY package*.json ./
RUN npm install
COPY client .
RUN npm run build

# Stage 2: Build the server
FROM node:22-alpine AS server
WORKDIR /app/server
# COPY the ROOT package.json to the current directory
COPY package*.json ./
RUN npm install
COPY server .

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=frontend /app/client/dist ./client
COPY --from=server /app/server ./server

# NOTE: You probably need node_modules in production too if not bundled
# So we usually copy the root package.json and install prod deps here
COPY package*.json ./
RUN npm install --production

RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser
USER appuser
EXPOSE 3000
CMD ["node", "server/index.cjs"]