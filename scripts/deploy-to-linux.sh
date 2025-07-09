#!/bin/bash

# Linux Deployment Script
# This script helps deploy the complete MongoDB setup to Linux machines

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
    echo "Usage: $0 {staging|production} [hostname]"
    echo ""
    echo "This script deploys MongoDB and sets up environment variables on Linux machines."
    echo ""
    echo "Arguments:"
    echo "  staging|production - Target environment"
    echo "  hostname          - SSH hostname (optional, will prompt if not provided)"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production myserver.com"
    echo ""
    echo "Prerequisites:"
    echo "  - SSH access to the target machine"
    echo "  - Docker and Docker Compose installed on target machine"
    echo "  - SSH key authentication (recommended)"
}

# Check prerequisites
check_prerequisites() {
    if ! command -v ssh &> /dev/null; then
        print_error "SSH is not installed on this machine"
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        print_error "SCP is not installed on this machine"
        exit 1
    fi
}

# Deploy to Linux machine
deploy_to_linux() {
    local environment=$1
    local hostname=$2
    
    if [ -z "$hostname" ]; then
        echo -n "Enter the SSH hostname for $environment: "
        read hostname
    fi
    
    print_header "Deploying to $environment environment on $hostname"
    
    # Create a temporary deployment directory
    local temp_dir=$(mktemp -d)
    print_status "Created temporary directory: $temp_dir"
    
    # Copy necessary files
    print_status "Copying deployment files..."
    cp -r scripts/ "$temp_dir/"
    cp docker-compose.mongodb.yml "$temp_dir/" 2>/dev/null || true
    cp docs/mongodb-setup.md "$temp_dir/" 2>/dev/null || true
    
    # Create deployment script for remote execution
    cat > "$temp_dir/deploy-remote.sh" << 'EOF'
#!/bin/bash
set -e

echo "Starting remote deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Make scripts executable
chmod +x scripts/*.sh

# Deploy MongoDB
echo "Deploying MongoDB..."
./scripts/deploy-mongodb.sh $ENVIRONMENT

# Generate environment files
echo "Setting up environment variables..."
./scripts/setup-env.sh generate $ENVIRONMENT

echo "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env.$ENVIRONMENT with your actual values"
echo "2. Start MongoDB: ./scripts/manage-mongodb.sh start $ENVIRONMENT"
echo "3. Test connection: ./scripts/manage-mongodb.sh status"
EOF
    
    chmod +x "$temp_dir/deploy-remote.sh"
    
    # Copy files to remote machine
    print_status "Copying files to $hostname..."
    scp -r "$temp_dir"/* "$hostname:~/won-mongodb-deploy/"
    
    # Execute deployment on remote machine
    print_status "Executing deployment on $hostname..."
    ssh "$hostname" "cd ~/won-mongodb-deploy && ENVIRONMENT=$environment ./deploy-remote.sh"
    
    # Clean up
    rm -rf "$temp_dir"
    
    print_status "Deployment completed!"
    print_status ""
    print_status "SSH into $hostname and run:"
    print_status "  cd ~/won-mongodb-deploy"
    print_status "  nano .env.$environment  # Update with your values"
    print_status "  ./scripts/manage-mongodb.sh start $environment"
    print_status "  ./scripts/manage-mongodb.sh status"
}

# Main script logic
check_prerequisites

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

ENVIRONMENT=$1
HOSTNAME=$2

case $ENVIRONMENT in
    staging|production)
        deploy_to_linux "$ENVIRONMENT" "$HOSTNAME"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        print_error "Use 'staging' or 'production'"
        exit 1
        ;;
esac 