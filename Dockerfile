# Multi-stage build: Frontend + Backend + Emulator

# Stage 1: Build Frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Stage 2: Backend and Emulator
FROM node:18
WORKDIR /app

# Install Backend dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend ./

# Install Emulator dependencies
COPY emulator/package.json emulator/package-lock.json ./
RUN npm install
COPY emulator ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Expose dynamic ports
CMD ["node", "server.js"]
