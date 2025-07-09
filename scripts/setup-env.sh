#!/bin/bash

# Environment Setup Script
# This script helps set up environment variables for different MongoDB instances

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
    echo "Usage: $0 {generate|show} [staging|production]"
    echo ""
    echo "Commands:"
    echo "  generate  - Generate environment variables for the specified environment"
    echo "  show      - Show current environment variables"
    echo ""
    echo "Environments:"
    echo "  staging   - Staging environment configuration"
    echo "  production - Production environment configuration"
    echo ""
    echo "Examples:"
    echo "  $0 generate staging"
    echo "  $0 show"
}

# Generate environment variables
generate_env() {
    local env=$1
    
    print_header "Generating environment variables for $env"
    
    case $env in
        staging)
            cat > .env.staging << EOF
# Staging Environment Configuration
NODE_ENV=staging
LOG_LEVEL=info

# API Configuration
API_HOST=0.0.0.0
API_PORT=3001
API_BASE_URL=https://staging-api.worldofnuclear.com
APP_BASE_URL=https://staging.won-app-next.pages.dev

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/won_staging

# MongoDB Configuration
MONGO_URL=mongodb://admin:stagingpassword123@localhost:27018/adventure

# JWT Configuration
JWT_SECRET_KEY=your-staging-jwt-secret-key-here-minimum-32-characters
COOKIE_SECRET=your-staging-cookie-secret-here
COOKIE_DOMAIN=staging.won-app-next.pages.dev

# Email Configuration
RESEND_AUTH_KEY=your-resend-auth-key
RESEND_FEEDBACK_KEY=your-resend-feedback-key
ADMIN_EMAIL=admin@worldofnuclear.com

# File Storage
MEMBER_IMAGE_FILE_PATH=/path/to/staging/member/images
MEMBER_IMAGE_VIEW_PATH=/member/images

# OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Security
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
EOF
            print_status "Generated .env.staging file"
            ;;
        production)
            cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
LOG_LEVEL=info

# API Configuration
API_HOST=0.0.0.0
API_PORT=3001
API_BASE_URL=https://api.worldofnuclear.com
APP_BASE_URL=https://worldofnuclear.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/won_production

# MongoDB Configuration
MONGO_URL=mongodb://admin:prodpassword123@localhost:27019/adventure

# JWT Configuration
JWT_SECRET_KEY=your-production-jwt-secret-key-here-minimum-48-characters
COOKIE_SECRET=your-production-cookie-secret-here
COOKIE_DOMAIN=worldofnuclear.com

# Email Configuration
RESEND_AUTH_KEY=your-resend-auth-key
RESEND_FEEDBACK_KEY=your-resend-feedback-key
ADMIN_EMAIL=admin@worldofnuclear.com

# File Storage
MEMBER_IMAGE_FILE_PATH=/path/to/production/member/images
MEMBER_IMAGE_VIEW_PATH=/member/images

# OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Security
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
EOF
            print_status "Generated .env.production file"
            ;;
        *)
            print_error "Invalid environment: $env"
            exit 1
            ;;
    esac
    
    print_warning "IMPORTANT: Update the generated .env.$env file with your actual values!"
    print_warning "Especially update:"
    print_warning "  - DATABASE_URL with your actual PostgreSQL connection string"
    print_warning "  - JWT_SECRET_KEY with a strong secret (use: node scripts/generate-secret.js)"
    print_warning "  - OAuth client IDs and secrets"
    print_warning "  - File paths for member images"
}

# Show current environment variables
show_env() {
    print_header "Current Environment Variables"
    echo ""
    
    if [ -f ".env" ]; then
        print_status "Local .env file exists"
        echo "=== .env file ==="
        cat .env
        echo ""
    else
        print_warning "No .env file found"
    fi
    
    if [ -f ".env.staging" ]; then
        print_status "Staging .env.staging file exists"
        echo "=== .env.staging file ==="
        cat .env.staging
        echo ""
    else
        print_warning "No .env.staging file found"
    fi
    
    if [ -f ".env.production" ]; then
        print_status "Production .env.production file exists"
        echo "=== .env.production file ==="
        cat .env.production
        echo ""
    else
        print_warning "No .env.production file found"
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
ENVIRONMENT=$2

case $COMMAND in
    generate)
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment: staging or production"
            exit 1
        fi
        generate_env "$ENVIRONMENT"
        ;;
    show)
        show_env
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac 