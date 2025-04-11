#!/bin/bash

echo "Setting up the database..."

# Run the migrations
echo "Running migrations..."
npm run db:push

echo "Setting up complete!"