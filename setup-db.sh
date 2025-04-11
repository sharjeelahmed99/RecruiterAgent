#!/bin/bash

echo "Setting up the database..."

# Run database push
echo "Running drizzle-kit push..."
npx drizzle-kit push

# Run migrations
echo "Running migrations..."
npx tsx scripts/migrate.ts

# Seed the database
echo "Seeding the database..."
npx tsx scripts/seed.ts

echo "Database setup complete!"