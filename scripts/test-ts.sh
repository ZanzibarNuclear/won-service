#!/bin/bash

# This script runs TypeScript tests by transpiling them on-the-fly

# Ensure ts-node is installed
if ! command -v ts-node &> /dev/null; then
    echo "ts-node is required but not installed. Installing..."
    npm install -g ts-node
fi

# Run the tests using ts-node
NODE_OPTIONS="--import=ts-node/register" node --test test/**/*.test.ts