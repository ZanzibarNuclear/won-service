# MongoDB Setup - Quick Reference

## Problem Solved

PATCH requests were returning 403 errors because users had different UUIDs across environments when using the same MongoDB instance.

## Solution

Separate MongoDB instances for each environment:

- **Development**: Port 27017
- **Staging**: Port 27018
- **Production**: Port 27019

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Deploy to staging server
./scripts/deploy-to-linux.sh staging your-staging-server.com

# Deploy to production server
./scripts/deploy-to-linux.sh production your-production-server.com
```

### Option 2: Manual Deployment

SSH into your Linux machine and run:

```bash
# Deploy MongoDB
./scripts/deploy-mongodb.sh staging
./scripts/deploy-mongodb.sh production

# Set up environment variables
./scripts/setup-env.sh generate staging
./scripts/setup-env.sh generate production

# Update the generated .env files with your actual values
nano .env.staging
nano .env.production
```

## Management Commands

```bash
# Check status
./scripts/manage-mongodb.sh status

# Start/Stop
./scripts/manage-mongodb.sh start staging
./scripts/manage-mongodb.sh stop production

# View logs
./scripts/manage-mongodb.sh logs staging

# Connect to shell
./scripts/manage-mongodb.sh connect production
```

## Connection Strings

- **Staging**: `mongodb://admin:stagingpassword123@localhost:27018/adventure`
- **Production**: `mongodb://admin:prodpassword123@localhost:27019/adventure`

## Environment Variables

Update your `.env.staging` and `.env.production` files:

```bash
# Staging
MONGO_URL=mongodb://admin:stagingpassword123@localhost:27018/adventure

# Production
MONGO_URL=mongodb://admin:prodpassword123@localhost:27019/adventure
```

## Next Steps

1. Deploy MongoDB instances using the scripts above
2. Update environment variables with correct MongoDB URLs
3. Test PATCH requests in each environment
4. Verify user authorization works correctly

## Documentation

For detailed instructions, see: `docs/mongodb-setup.md`
