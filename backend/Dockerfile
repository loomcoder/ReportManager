# Backend Dockerfile for 30ReportManager
FROM node:20-slim

# Install dependencies for better-sqlite3 native module
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for nodemon)
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 3025

ENV PORT=3025
ENV HOSTNAME="0.0.0.0"

# Start the server with nodemon for hot-reloading in development
CMD ["npm", "run", "dev"]
