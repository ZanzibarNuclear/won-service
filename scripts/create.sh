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

# Grant permissions to won_app on the database
psql -c "GRANT CONNECT ON DATABASE $DB_NAME TO $APP_ROLE;"
psql -c "ALTER DATABASE $DB_NAME OWNER TO $ADMIN_ROLE;"

# Grant usage on all current and future tables in the public schema
psql -d $DB_NAME -c "GRANT USAGE ON SCHEMA public TO $APP_ROLE;"
psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $APP_ROLE;"

EOF

echo "Database setup completed with roles: $ADMIN_ROLE and $APP_ROLE for database: $DB_NAME."
