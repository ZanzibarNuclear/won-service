#!/bin/bash

# MongoDB Management Script
# This script helps manage MongoDB instances for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|connect} [staging|production]"
    echo ""
    echo "Commands:"
    echo "  start     - Start MongoDB for the specified environment"
    echo "  stop      - Stop MongoDB for the specified environment"
    echo "  restart   - Restart MongoDB for the specified environment"
    echo "  status    - Show status of MongoDB containers"
    echo "  logs      - Show logs for MongoDB container"
    echo "  connect   - Connect to MongoDB shell"
    echo "  deploy    - Deploy MongoDB for the specified environment"
    echo ""
    echo "Environments:"
    echo "  staging   - Staging environment (port 27018)"
    echo "  production - Production environment (port 27019)"
    echo ""
    echo "Examples:"
    echo "  $0 start staging"
    echo "  $0 status"
    echo "  $0 connect production"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Start MongoDB for environment
start_mongodb() {
    local env=$1
    local compose_file="docker-compose.mongodb-${env}.yml"
    
    if [ ! -f "$compose_file" ]; then
        print_error "Docker Compose file not found: $compose_file"
        print_status "Run '$0 deploy $env' first to create the configuration."
        exit 1
    fi
    
    print_status "Starting MongoDB for $env environment..."
    docker-compose -f "$compose_file" up -d
    print_status "MongoDB for $env is starting..."
}

# Stop MongoDB for environment
stop_mongodb() {
    local env=$1
    local compose_file="docker-compose.mongodb-${env}.yml"
    
    if [ ! -f "$compose_file" ]; then
        print_error "Docker Compose file not found: $compose_file"
        exit 1
    fi
    
    print_status "Stopping MongoDB for $env environment..."
    docker-compose -f "$compose_file" down
    print_status "MongoDB for $env stopped."
}

# Restart MongoDB for environment
restart_mongodb() {
    local env=$1
    print_status "Restarting MongoDB for $env environment..."
    stop_mongodb "$env"
    sleep 2
    start_mongodb "$env"
}

# Show status of all MongoDB containers
show_status() {
    print_header "MongoDB Container Status"
    echo ""
    
    # Check staging
    if docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "won-mongodb-staging"; then
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "won-mongodb-staging"
    else
        print_warning "Staging MongoDB container not found"
    fi
    
    echo ""
    
    # Check production
    if docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "won-mongodb-prod"; then
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "won-mongodb-prod"
    else
        print_warning "Production MongoDB container not found"
    fi
    
    echo ""
    print_status "Connection strings:"
    print_status "  Staging: mongodb://admin:stagingpassword123@localhost:27018/adventure"
    print_status "  Production: mongodb://admin:prodpassword123@localhost:27019/adventure"
}

# Show logs for environment
show_logs() {
    local env=$1
    local container_name="won-mongodb-${env}"
    
    if docker ps | grep -q "$container_name"; then
        print_status "Showing logs for $env MongoDB..."
        docker logs -f "$container_name"
    else
        print_error "MongoDB container for $env is not running"
        exit 1
    fi
}

# Connect to MongoDB shell
connect_mongodb() {
    local env=$1
    local container_name="won-mongodb-${env}"
    
    if docker ps | grep -q "$container_name"; then
        print_status "Connecting to MongoDB shell for $env..."
        docker exec -it "$container_name" mongosh adventure -u admin -p "${env}password123"
    else
        print_error "MongoDB container for $env is not running"
        exit 1
    fi
}

# Deploy MongoDB for environment
deploy_mongodb() {
    local env=$1
    print_status "Deploying MongoDB for $env environment..."
    ./scripts/deploy-mongodb.sh "$env"
}

# Main script logic
check_docker

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
ENVIRONMENT=$2

case $COMMAND in
    start)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        start_mongodb "$ENVIRONMENT"
        ;;
    stop)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        stop_mongodb "$ENVIRONMENT"
        ;;
    restart)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        restart_mongodb "$ENVIRONMENT"
        ;;
    status)
        show_status
        ;;
    logs)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        show_logs "$ENVIRONMENT"
        ;;
    connect)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        connect_mongodb "$ENVIRONMENT"
        ;;
    deploy)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        deploy_mongodb "$ENVIRONMENT"
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac 