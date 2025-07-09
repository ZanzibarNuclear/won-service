# MongoDB Setup for Multiple Environments

This document explains how to set up separate MongoDB instances for development, staging, and production environments to avoid UUID conflicts between users.

## Problem

When using the same MongoDB instance across environments, users created on different systems get different UUIDs, causing authorization failures when trying to update resources (PATCH requests return 403 errors).

## Solution

Set up separate MongoDB instances for each environment:

- **Development**: Local MongoDB (port 27017)
- **Staging**: Staging MongoDB (port 27018)
- **Production**: Production MongoDB (port 27019)

## Prerequisites

- Docker and Docker Compose installed on your Linux machines
- Access to the Linux machines where you want to deploy MongoDB

## Quick Start

### 1. Deploy MongoDB on Linux Machines

SSH into your Linux machine and run:

```bash
# Clone or copy the won-service repository
cd /path/to/won-service

# Deploy MongoDB for staging
./scripts/deploy-mongodb.sh staging

# Deploy MongoDB for production
./scripts/deploy-mongodb.sh production
```

### 2. Set Up Environment Variables

```bash
# Generate environment configuration files
./scripts/setup-env.sh generate staging
./scripts/setup-env.sh generate production

# Update the generated files with your actual values
nano .env.staging
nano .env.production
```

### 3. Manage MongoDB Instances

```bash
# Check status of all MongoDB containers
./scripts/manage-mongodb.sh status

# Start MongoDB for staging
./scripts/manage-mongodb.sh start staging

# Stop MongoDB for production
./scripts/manage-mongodb.sh stop production

# View logs
./scripts/manage-mongodb.sh logs staging

# Connect to MongoDB shell
./scripts/manage-mongodb.sh connect production
```

## Detailed Setup

### Docker-based MongoDB (Recommended)

The setup uses Docker containers for easy management and isolation:

#### Ports

- **Development**: 27017 (if running locally)
- **Staging**: 27018
- **Production**: 27019

#### Credentials

- **Staging**: `admin` / `stagingpassword123`
- **Production**: `admin` / `prodpassword123`

#### Connection Strings

- **Staging**: `mongodb://admin:stagingpassword123@localhost:27018/adventure`
- **Production**: `mongodb://admin:prodpassword123@localhost:27019/adventure`

### Environment Variables

Update your environment files with the correct MongoDB URLs:

#### Staging (.env.staging)

```bash
NODE_ENV=staging
MONGO_URL=mongodb://admin:stagingpassword123@localhost:27018/adventure
# ... other variables
```

#### Production (.env.production)

```bash
NODE_ENV=production
MONGO_URL=mongodb://admin:prodpassword123@localhost:27019/adventure
# ... other variables
```

## Management Commands

### Deployment Script (`deploy-mongodb.sh`)

```bash
# Deploy MongoDB for staging
./scripts/deploy-mongodb.sh staging

# Deploy MongoDB for production
./scripts/deploy-mongodb.sh production
```

### Management Script (`manage-mongodb.sh`)

```bash
# Show all commands
./scripts/manage-mongodb.sh

# Start MongoDB
./scripts/manage-mongodb.sh start staging

# Stop MongoDB
./scripts/manage-mongodb.sh stop production

# Restart MongoDB
./scripts/manage-mongodb.sh restart staging

# Check status
./scripts/manage-mongodb.sh status

# View logs
./scripts/manage-mongodb.sh logs staging

# Connect to shell
./scripts/manage-mongodb.sh connect production
```

### Environment Setup Script (`setup-env.sh`)

```bash
# Generate environment files
./scripts/setup-env.sh generate staging
./scripts/setup-env.sh generate production

# Show current environment files
./scripts/setup-env.sh show
```

## Database Initialization

The MongoDB containers automatically initialize with:

- Database: `adventure`
- Collections: `adventures`, `storylines`, `scenes`, `chapters`, `content`, `transitions`
- Indexes for better performance

## Security Considerations

### Passwords

- Change the default passwords in production
- Use strong, unique passwords for each environment
- Store passwords securely (not in version control)

### Network Access

- MongoDB containers are only accessible from localhost
- For remote access, configure proper firewall rules
- Consider using VPN or SSH tunneling for secure access

### Data Backup

- Set up regular backups of your MongoDB data
- Test backup and restore procedures
- Store backups in a secure location

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check Docker logs
docker logs won-mongodb-staging

# Check if port is already in use
netstat -tulpn | grep 27018
```

#### Connection Refused

```bash
# Check if container is running
docker ps | grep mongodb

# Check container status
./scripts/manage-mongodb.sh status
```

#### Authentication Failed

```bash
# Verify connection string
echo $MONGO_URL

# Test connection manually
docker exec -it won-mongodb-staging mongosh adventure -u admin -p stagingpassword123
```

### Logs and Debugging

```bash
# View MongoDB logs
./scripts/manage-mongodb.sh logs staging

# View Docker container logs
docker logs -f won-mongodb-staging

# Check container resource usage
docker stats won-mongodb-staging
```

## Migration from Single MongoDB

If you're currently using a single MongoDB instance:

1. **Backup existing data**:

   ```bash
   mongodump --uri="mongodb://your-current-connection-string"
   ```

2. **Deploy new MongoDB instances** using the scripts above

3. **Restore data to appropriate environments**:

   ```bash
   mongorestore --uri="mongodb://admin:stagingpassword123@localhost:27018/adventure" dump/
   ```

4. **Update application configuration** to use environment-specific MongoDB URLs

5. **Test thoroughly** in each environment before switching

## Monitoring

### Health Checks

```bash
# Check if MongoDB is responding
docker exec won-mongodb-staging mongosh --eval "db.runCommand('ping')"

# Check database stats
docker exec won-mongodb-staging mongosh adventure --eval "db.stats()"
```

### Performance Monitoring

- Monitor disk usage for MongoDB data volumes
- Check memory usage of MongoDB containers
- Monitor connection counts and query performance

## Next Steps

After setting up separate MongoDB instances:

1. Update your application deployment scripts to use the correct environment variables
2. Test PATCH requests in each environment
3. Set up monitoring and alerting for MongoDB instances
4. Document the setup process for your team
5. Consider setting up automated backups

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review MongoDB and Docker logs
3. Verify environment variables are correctly set
4. Ensure Docker and Docker Compose are properly installed
