#!/bin/bash

# MongoDB Deployment Script for Linux Machines
# This script sets up MongoDB instances for staging and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to deploy MongoDB for a specific environment
deploy_mongodb() {
    local environment=$1
    local port=$2
    
    print_status "Deploying MongoDB for $environment environment on port $port"
    
    # Create environment-specific docker-compose file
    cat > docker-compose.mongodb-${environment}.yml << EOF
version: '3.8'

services:
  mongodb-${environment}:
    image: mongo:7.0
    container_name: won-mongodb-${environment}
    restart: unless-stopped
    ports:
      - "${port}:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${environment}password123
      MONGO_INITDB_DATABASE: adventure
    volumes:
      - mongodb_${environment}_data:/data/db
      - ./scripts/mongo/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - won-network

volumes:
  mongodb_${environment}_data:

networks:
  won-network:
    driver: bridge
EOF

    # Start the MongoDB container
    print_status "Starting MongoDB container for $environment..."
    docker-compose -f docker-compose.mongodb-${environment}.yml up -d
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    sleep 10
    
    # Test connection
    if docker exec won-mongodb-${environment} mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_status "MongoDB for $environment is running successfully!"
        print_status "Connection string: mongodb://admin:${environment}password123@localhost:${port}/adventure"
    else
        print_error "Failed to start MongoDB for $environment"
        exit 1
    fi
}

# Main deployment logic
print_status "Starting MongoDB deployment..."

# Determine environment from command line argument
ENVIRONMENT=${1:-staging}

case $ENVIRONMENT in
    staging)
        deploy_mongodb "staging" "27018"
        ;;
    production)
        deploy_mongodb "production" "27019"
        ;;
    *)
        print_error "Invalid environment. Use 'staging' or 'production'"
        exit 1
        ;;
esac

print_status "MongoDB deployment completed successfully!"
print_status "Remember to update your environment variables:"
print_status "  MONGO_URL=mongodb://admin:${ENVIRONMENT}password123@localhost:$(if [ "$ENVIRONMENT" = "staging" ]; then echo "27018"; else echo "27019"; fi)/adventure" 