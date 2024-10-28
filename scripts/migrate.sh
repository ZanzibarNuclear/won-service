#!/bin/bash

# Create a directory for the compiled files
mkdir -p dist

# Compile the TypeScript files and output them to the dist directory
npx tsc -p tsconfig.json

# Assign the first argument to a variable
command=$1

if [ "$command" == "up" ]; then
  node dist/db/migrate.js up
elif [ "$command" == "down" ]; then
  node dist/db/migrate.js down
elif [ "$command" == "latest" ]; then
  node dist/db/migrate.js latest
else
  echo "Invalid command. Please use 'up', 'down', or 'latest'."
fi

# Delete the dist directory and all of its contents
rm -rf dist