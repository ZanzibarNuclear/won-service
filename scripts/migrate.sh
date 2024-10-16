#!/bin/bash

# Create a directory for the compiled files
mkdir -p dist

# Compile the TypeScript files and output them to the dist directory
npx tsc -p tsconfig.json

# Run the migrator.js script from the dist directory
node dist/db/Migrate.js

# Delete the dist directory and all of its contents
# rm -rf dist