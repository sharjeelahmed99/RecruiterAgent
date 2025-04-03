import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import pgConnectionString from 'pg-connection-string';
const { parse } = pgConnectionString;
import { log } from '../server/vite';

async function runMigrations() {
  // Parse database connection string
  const connectionConfig = parse(process.env.DATABASE_URL || "");

  // Create a PostgreSQL connection pool
  const pool = new Pool({
    host: connectionConfig.host || process.env.PGHOST,
    port: connectionConfig.port ? parseInt(connectionConfig.port) : process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    user: connectionConfig.user || process.env.PGUSER,
    password: connectionConfig.password || process.env.PGPASSWORD,
    database: connectionConfig.database || process.env.PGDATABASE,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  try {
    log('Running migrations...', 'drizzle');
    await migrate(db, { migrationsFolder: 'migrations' });
    log('Migrations completed successfully!', 'drizzle');
  } catch (error) {
    log(`Migration failed: ${error}`, 'drizzle');
  } finally {
    await pool.end();
  }
}

runMigrations();