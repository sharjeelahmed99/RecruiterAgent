import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import pgConnectionString from 'pg-connection-string';
const { parse } = pgConnectionString;
import { log } from '../server/vite';
import * as schema from '../shared/schema';
import { pgStorage } from '../server/pg-storage';

async function seedDatabase() {
  try {
    log('Seeding database with initial data...', 'drizzle');
    
    // Initialize with sample data
    await pgStorage.initializeData();
    
    log('Database seeded successfully!', 'drizzle');
  } catch (error) {
    log(`Database seeding failed: ${error}`, 'drizzle');
  }
}

seedDatabase();