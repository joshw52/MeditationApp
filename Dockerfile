# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build backend and serve frontend
FROM node:22-alpine

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./

# Copy frontend build from previous stage
COPY --from=frontend-builder /app/client/build ./client/build

EXPOSE 8080

CMD ["npm", "start"]
