#!/bin/bash

# Setup script for Report Manager Project
# This script guides the user through setting up the project components.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      Report Manager Project Installer         ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo -e "${RED}Error: .env.example not found.${NC}"
        # Create a basic .env if example is missing
        echo "SECRET_KEY=supersecretkey" > .env
        echo "NODE_ENV=production" >> .env
        echo "PORT=3025" >> .env
        echo "OLLAMA_URL=http://127.0.0.1:11434" >> .env
    fi
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# --- Component Selection ---

echo -e "\n${BLUE}--- Component Setup Configuration ---${NC}"

# Backend API
echo -e "\nHow would you like to set up the ${YELLOW}Backend API (Node.js)${NC}?"
echo "1) Local (npm install & run)"
echo "2) Docker"
read -r -p "Enter choice [1/2]: " backend_choice

# Cube.js
echo -e "\nHow would you like to set up ${YELLOW}Cube.js (Analytics Engine)${NC}?"
echo "1) Local (Run with Backend)" 
echo "2) Docker"
read -r -p "Enter choice [1/2]: " cube_choice

# Frontend
echo -e "\nHow would you like to set up the ${YELLOW}Frontend (Next.js)${NC}?"
echo "1) Local (npm install & run)"
echo "2) Docker"
read -r -p "Enter choice [1/2]: " frontend_choice

# Database
echo -e "\nWhich ${YELLOW}Database${NC} should the Application use?"
echo "1) SQLite (Default, File-based)"
echo "2) Postgres (Production-ready)"
read -r -p "Enter choice [1/2]: " db_choice

# Ollama
echo -e "\nHow would you like to set up ${YELLOW}Ollama (AI Engine)${NC}?"
echo "1) Local (Use existing installation on host)"
echo "2) Docker"
read -r -p "Enter choice [1/2]: " ollama_choice

# --- Configuration & Installation ---

echo -e "\n${BLUE}--- Configuring Environment ---${NC}"

# Configure Database in .env
if [ "$db_choice" == "2" ]; then
    echo -e "${YELLOW}Configuring Application to use Postgres...${NC}"
    
    # Update DB_TYPE
    if grep -q "DB_TYPE=" .env; then
         if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DB_TYPE=.*|DB_TYPE=postgres|" .env
         else
            sed -i "s|DB_TYPE=.*|DB_TYPE=postgres|" .env
         fi
    else
        echo "DB_TYPE=postgres" >> .env
    fi

    # Set Postgres Defaults (matching the docker-compose service)
    # If running backend in docker, use 'postgres' as host (service name)
    # If running backend locally, use 'localhost'
    if [ "$backend_choice" == "2" ]; then
        DB_HOST="postgres"
    else
        DB_HOST="localhost"
    fi
    
    echo "DB_HOST=$DB_HOST" >> .env
    echo "DB_PORT=5432" >> .env
    echo "DB_USER=admin" >> .env
    echo "DB_PASSWORD=password" >> .env
    echo "DB_NAME=production" >> .env
else
    echo -e "${GREEN}Using SQLite (Default).${NC}"
    if grep -q "DB_TYPE=" .env; then
         if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DB_TYPE=.*|DB_TYPE=sqlite|" .env
         else
            sed -i "s|DB_TYPE=.*|DB_TYPE=sqlite|" .env
         fi
    else
        echo "DB_TYPE=sqlite" >> .env
    fi
fi


# Determine Ollama URL
OLLAMA_URL="http://127.0.0.1:11434"
if [ "$backend_choice" == "2" ] && [ "$ollama_choice" == "2" ]; then
    OLLAMA_URL="http://ollama:11434"
elif [ "$backend_choice" == "2" ] && [ "$ollama_choice" == "1" ]; then
    # Warn about Linux host access
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
         echo -e "${YELLOW}Note: Accessing local Ollama from Docker container on Linux might require extra config (e.g. --add-host).${NC}"
         OLLAMA_URL="http://host.docker.internal:11434" 
    else
         OLLAMA_URL="http://host.docker.internal:11434"
    fi
fi

# Update .env
if grep -q "OLLAMA_URL=" .env; then
     if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|OLLAMA_URL=.*|OLLAMA_URL=$OLLAMA_URL|" .env
     else
        sed -i "s|OLLAMA_URL=.*|OLLAMA_URL=$OLLAMA_URL|" .env
     fi
else
    echo "OLLAMA_URL=$OLLAMA_URL" >> .env
fi
echo -e "${GREEN}Updated .env with OLLAMA_URL=$OLLAMA_URL${NC}"

# --- Local Setup ---

# Backend Local
if [ "$backend_choice" == "1" ]; then
    echo -e "\n${BLUE}Setting up Backend Locally...${NC}"
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        echo -e "${GREEN}Backend dependencies installed.${NC}"
    else
        echo -e "${RED}Backend directory not found!${NC}"
    fi
fi

# Frontend Local
if [ "$frontend_choice" == "1" ]; then
    echo -e "\n${BLUE}Setting up Frontend Locally...${NC}"
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}Frontend dependencies installed.${NC}"
    else
         echo -e "${RED}Frontend directory not found!${NC}"
    fi
fi


# --- Docker Setup ---

DOCKER_SERVICES=""

if [ "$backend_choice" == "2" ]; then
    DOCKER_SERVICES="$DOCKER_SERVICES backend"
fi

if [ "$cube_choice" == "2" ]; then
    DOCKER_SERVICES="$DOCKER_SERVICES cube"
fi

if [ "$frontend_choice" == "2" ]; then
    DOCKER_SERVICES="$DOCKER_SERVICES frontend"
fi

if [ "$db_choice" == "2" ]; then
    # Start Postgres if chosen
    DOCKER_SERVICES="$DOCKER_SERVICES postgres"
fi

if [ "$ollama_choice" == "2" ]; then
    DOCKER_SERVICES="$DOCKER_SERVICES ollama"
fi

if [ -n "$DOCKER_SERVICES" ]; then
    echo -e "\n${BLUE}Starting Docker Services: $DOCKER_SERVICES ...${NC}"
    docker compose up -d --build $DOCKER_SERVICES
    echo -e "${GREEN}Docker services started.${NC}"
else
    echo -e "\n${YELLOW}No Docker services selected.${NC}"
fi

# --- Final Instructions ---

echo -e "\n${BLUE}===============================================${NC}"
echo -e "${GREEN}      Setup Complete!         ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

if [ "$backend_choice" == "1" ]; then
    echo -e "To start ${YELLOW}Backend API${NC} locally:"
    echo -e "  cd backend && npm start"
fi

if [ "$cube_choice" == "1" ]; then
    echo -e "To start ${YELLOW}Cube.js${NC} locally:"
    echo -e "  cd backend && npm run cube"
fi

if [ "$frontend_choice" == "1" ]; then
    echo -e "To start ${YELLOW}Frontend${NC} locally:"
    echo -e "  cd frontend && npm run dev"
fi

if [ "$db_choice" == "2" ]; then
    echo -e "Postgres database is configured and running."
fi

echo -e "\nAccess the application at: ${BLUE}http://localhost:3050${NC}"
