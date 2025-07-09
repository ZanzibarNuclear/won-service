#!/bin/bash

# MongoDB Database Setup Script
# This script creates separate databases for different environments within the same MongoDB instance

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
    echo "Usage: $0 {create|list|drop} [environment]"
    echo ""
    echo "Commands:"
    echo "  create  - Create databases for specified environment(s)"
    echo "  list    - List all databases"
    echo "  drop    - Drop database for specified environment"
    echo ""
    echo "Environments:"
    echo "  dev       - Development environment"
    echo "  staging   - Staging environment"
    echo "  prod      - Production environment"
    echo "  all       - All environments"
    echo ""
    echo "Examples:"
    echo "  $0 create all"
    echo "  $0 create staging"
    echo "  $0 list"
    echo "  $0 drop staging"
}

# Check if MongoDB is running
check_mongodb() {
    if ! mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_error "MongoDB is not running or not accessible"
        print_status "Please start MongoDB first:"
        print_status "  docker-compose -f docker-compose.mongodb.yml up -d"
        exit 1
    fi
}

# Create database for environment
create_database() {
    local env=$1
    local db_name="won_${env}"
    
    print_status "Creating database: $db_name"
    
    mongosh --eval "
        use $db_name;
        db.createCollection('adventures');
        db.createCollection('storylines');
        db.createCollection('scenes');
        print('Database $db_name created with collections');
    "
    
    print_status "Database $db_name created successfully"
}

# List all databases
list_databases() {
    print_header "MongoDB Databases"
    echo ""
    mongosh --eval "db.adminCommand('listDatabases')" | grep -E "(name|won_)"
}

# Drop database for environment
drop_database() {
    local env=$1
    local db_name="won_${env}"
    
    print_warning "Are you sure you want to drop database: $db_name? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Dropping database: $db_name"
        mongosh --eval "use $db_name; db.dropDatabase(); print('Database $db_name dropped')"
        print_status "Database $db_name dropped successfully"
    else
        print_status "Database drop cancelled"
    fi
}

# Main script logic
check_mongodb

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
ENVIRONMENT=$2

case $COMMAND in
    create)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: dev, staging, prod, or all"
            exit 1
        fi
        
        case $ENVIRONMENT in
            dev)
                create_database "dev"
                ;;
            staging)
                create_database "staging"
                ;;
            prod)
                create_database "prod"
                ;;
            all)
                create_database "dev"
                create_database "staging"
                create_database "prod"
                ;;
            *)
                print_error "Invalid environment: $ENVIRONMENT"
                exit 1
                ;;
        esac
        ;;
    list)
        list_databases
        ;;
    drop)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: dev, staging, or prod"
            exit 1
        fi
        
        case $ENVIRONMENT in
            dev|staging|prod)
                drop_database "$ENVIRONMENT"
                ;;
            *)
                print_error "Invalid environment: $ENVIRONMENT"
                exit 1
                ;;
        esac
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac 