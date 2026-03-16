#!/bin/bash

# ChatBI Agent Frontend Deployment Script
# This script handles deployment for development, staging, and production environments

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env.local ]; then
        log_warning ".env.local not found, creating from .env.example"
        cp .env.example .env.local
        log_info "Please edit .env.local with your configuration"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
}

# Install mock server dependencies
install_mock_dependencies() {
    log_info "Installing mock server dependencies..."
    cp mock-package.json mock-package.json.tmp
    cat mock-package.json.tmp > package.json
    npm install express cors uuid
    mv mock-package.json.tmp mock-package.json
    log_success "Mock server dependencies installed"
}

# Build for production
build_production() {
    log_info "Building for production..."
    npm run build
    log_success "Build completed. Output in dist/"
}

# Start development server
start_dev() {
    log_info "Starting development servers..."

    # Start mock server in background
    log_info "Starting mock BFF server on port 8001..."
    node mock-server.js &
    MOCK_PID=$!
    echo $MOCK_PID > .mock-server.pid
    log_success "Mock server started (PID: $MOCK_PID)"

    # Start frontend dev server
    log_info "Starting frontend on http://localhost:5173"
    npm run dev
}

# Stop development servers
stop_dev() {
    log_info "Stopping development servers..."

    if [ -f .mock-server.pid ]; then
        MOCK_PID=$(cat .mock-server.pid)
        kill $MOCK_PID 2>/dev/null || true
        rm .mock-server.pid
        log_success "Mock server stopped"
    fi
}

# Build Docker images
build_docker() {
    log_info "Building Docker images..."

    docker build -t chatbi-frontend:latest .
    docker build -f Dockerfile.bff -t chatbi-bff:latest .

    log_success "Docker images built"
}

# Start Docker containers
start_docker() {
    log_info "Starting Docker containers..."

    docker-compose up -d

    log_success "Docker containers started"
    log_info "Frontend: http://localhost:3000"
    log_info "API: http://localhost:8001"
}

# Stop Docker containers
stop_docker() {
    log_info "Stopping Docker containers..."
    docker-compose down
    log_success "Docker containers stopped"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."

    # Build
    build_production

    # Docker
    build_docker

    # Tag for production
    docker tag chatbi-frontend:latest chatbi-frontend:production
    docker tag chatbi-bff:latest chatbi-bff:production

    log_success "Production build completed"
    log_info "To deploy, run: docker push your-registry/chatbi-frontend:production"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    npm run test 2>/dev/null || log_warning "No tests configured"
}

# Health check
health_check() {
    log_info "Checking health..."

    # Check mock server
    if curl -s http://localhost:8001/health > /dev/null; then
        log_success "Mock BFF server is healthy"
    else
        log_warning "Mock BFF server is not running"
    fi

    # Check frontend
    if curl -s http://localhost:5173 > /dev/null; then
        log_success "Frontend is running"
    else
        log_warning "Frontend is not running"
    fi
}

# Clean build artifacts
clean() {
    log_info "Cleaning build artifacts..."
    rm -rf dist/ node_modules/ .mock-server.pid
    log_success "Clean completed"
}

# Show help
show_help() {
    cat << EOF
ChatBI Agent Frontend Deployment Script

Usage: ./deploy.sh [COMMAND]

Commands:
    dev         Start development servers
    stop        Stop development servers
    build       Build for production
    docker      Build and start Docker containers
    docker-stop Stop Docker containers
    deploy      Deploy to production
    test        Run tests
    health      Check health status
    clean       Clean build artifacts
    help        Show this help message

Examples:
    ./deploy.sh dev           # Start development environment
    ./deploy.sh build         # Build for production
    ./deploy.sh docker        # Start with Docker
    ./deploy.sh deploy        # Deploy to production

EOF
}

# Main script logic
main() {
    case "${1:-help}" in
        dev)
            check_env_file
            install_dependencies
            install_mock_dependencies
            start_dev
            ;;
        stop)
            stop_dev
            ;;
        build)
            check_env_file
            install_dependencies
            build_production
            ;;
        docker)
            build_docker
            start_docker
            ;;
        docker-stop)
            stop_docker
            ;;
        deploy)
            deploy_production
            ;;
        test)
            run_tests
            ;;
        health)
            health_check
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap to cleanup on exit
trap stop_dev EXIT INT TERM

# Run main function
main "$@"