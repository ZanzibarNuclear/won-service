#!/bin/bash

# Initialize variables
DB_NAME=""
ADMIN_ROLE="won_admin"
APP_ROLE="won_app"

# Parse command-line options
while getopts "d:" opt; do
  case $opt in
    d)
      DB_NAME="$OPTARG"
      ;;
    *)
      echo "Usage: $0 -d your_database_name"
      exit 1
      ;;
  esac
done

# Check if DB_NAME is provided
if [ -z "$DB_NAME" ]; then
  echo "Database name is required. Usage: $0 -d your_database_name"
  exit 1
fi

# Switch to the postgres user
sudo -i -u postgres bash << EOF

# Create roles
psql -c "CREATE ROLE $ADMIN_ROLE WITH LOGIN CREATEDB;"
psql -c "CREATE ROLE $APP_ROLE WITH LOGIN;"

# Create the database with won_admin as owner
psql -c "CREATE DATABASE $DB_NAME OWNER $ADMIN_ROLE;"

EOF

echo "Database setup completed with roles: $ADMIN_ROLE and $APP_ROLE for database: $DB_NAME."
