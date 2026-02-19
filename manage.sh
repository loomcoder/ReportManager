#!/bin/bash

# ============================================================================
# Report Manager - Management Script
# ============================================================================
# Description: Control script for managing the Report Manager application.
#              Handles Docker services (backend) and local frontend development.
# ============================================================================

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${CYAN}Report Manager Management Script${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./manage.sh [COMMAND]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}start${NC}    : Start backend services (Docker) and frontend (Local)"
    echo -e "  ${GREEN}stop${NC}     : Stop all backend Docker services"
    echo -e "  ${GREEN}restart${NC}  : Restart backend Docker services"
    echo -e "  ${GREEN}build${NC}    : Rebuild backend Docker images"
    echo -e "  ${GREEN}logs${NC}     : View logs from backend Docker services"
    echo -e "  ${GREEN}clean${NC}    : Stop services and remove volumes (clean slate)"
    echo -e "  ${GREEN}help${NC}     : Show this help message"
    echo ""
}

# Function to start services
cmd_start() {
    echo -e "${CYAN}Starting Report Manager...${NC}"
    
    # 1. Stop any potential zombie frontend container from previous full-docker runs
    echo -e "${CYAN}Ensuring no conflicting frontend containers are running...${NC}"
    docker stop report-manager-frontend 2>/dev/null || true

    # 2. Start Backend services via Docker Compose
    echo -e "${CYAN}Starting backend services (Database, API, Cube.js, Ollama)...${NC}"
    if docker compose up -d backend cube ollama postgres; then
        echo -e "${GREEN}Backend services started successfully.${NC}"
    else
        echo -e "${RED}Failed to start backend services.${NC}"
        exit 1
    fi

    # Load ports from .env for display
    BACKEND_PORT=$(grep "^PORT=" .env 2>/dev/null | cut -d '=' -f2)
    BACKEND_PORT=${BACKEND_PORT:-3025}
    
    OLLAMA_PORT=$(grep "^OLLAMA_PORT=" .env 2>/dev/null | cut -d '=' -f2)
    OLLAMA_PORT=${OLLAMA_PORT:-11434}

    echo -e "${YELLOW}Service Status:${NC}"
    echo -e "  - Backend API : http://localhost:${BACKEND_PORT}"
    echo -e "  - Cube.js     : http://localhost:4000"
    echo -e "  - Ollama      : http://localhost:${OLLAMA_PORT}"
    echo ""

    # 3. Start Frontend locally
    echo -e "${CYAN}Starting Frontend (Local Development Mode)...${NC}"
    
    # Check and free port 3050
    APP_PORT=3050
    if command -v lsof >/dev/null 2>&1; then
        PID=$(lsof -t -i:$APP_PORT)
        if [ -n "$PID" ]; then
            echo -e "${YELLOW}Port $APP_PORT is in use by PID $PID. Killing it...${NC}"
            kill -9 $PID 2>/dev/null || true
        fi
    elif command -v fuser >/dev/null 2>&1; then
        if fuser $APP_PORT/tcp >/dev/null 2>&1; then
             echo -e "${YELLOW}Port $APP_PORT is in use. Killing it...${NC}"
             fuser -k -n tcp $APP_PORT >/dev/null 2>&1 || true
        fi
    fi

    if command -v npm >/dev/null 2>&1; then
        if [ -d "frontend" ]; then
            cd frontend || exit
            
            # Install dependencies if missing
            if [ ! -d "node_modules" ]; then
                echo -e "${YELLOW}Installing frontend dependencies...${NC}"
                npm install
            fi

            # Export env vars from root .env for Next.js to use
            if [ -f "../.env" ]; then
                echo -e "${CYAN}Loading environment variables from .env...${NC}"
                set -a
                source "../.env"
                set +a
            fi

            echo -e "${GREEN}Launching Next.js (Local)...${NC}"
            echo -e "${CYAN}Access the app at: http://localhost:3050${NC}"
            npm run dev
        else
            echo -e "${RED}Frontend directory not found!${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}npm not found on host. Starting Frontend in Docker...${NC}"
        docker compose up -d frontend
        echo -e "${GREEN}Frontend started in Docker.${NC}"
        echo -e "${CYAN}Access the app at: http://localhost:3050${NC}"
    fi
}

# Function to stop services
cmd_stop() {
    echo -e "${CYAN}Stopping backend services...${NC}"
    docker compose down
    echo -e "${GREEN}Services stopped.${NC}"
}

# Function to restart backend services
cmd_restart() {
    echo -e "${CYAN}Restarting backend services...${NC}"
    docker compose restart
    echo -e "${GREEN}Backend services restarted.${NC}"
}

# Function to build docker images
cmd_build() {
    echo -e "${CYAN}Building backend Docker images...${NC}"
    docker compose build
    echo -e "${GREEN}Build complete.${NC}"
}

# Function to view logs
cmd_logs() {
    echo -e "${CYAN}Following backend logs (Ctrl+C to exit)...${NC}"
    docker compose logs -f
}

# Function to clean env
cmd_clean() {
    echo -e "${RED}WARNING: This will stop services and remove all persistent volumes (Database data will be lost).${NC}"
    read -p "Are you sure? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Cleaning up...${NC}"
        docker compose down -v --remove-orphans
        echo -e "${GREEN}Cleanup complete.${NC}"
    else
        echo -e "${YELLOW}Cancelled.${NC}"
    fi
}

# Main Command Dispatcher
case "$1" in
    start)
        cmd_start
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    build)
        cmd_build
        ;;
    logs)
        cmd_logs
        ;;
    clean)
        cmd_clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            echo -e "${RED}Unknown command: $1${NC}"
            show_help
            exit 1
        fi
        ;;
esac
