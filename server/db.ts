import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import pgConnectionString from "pg-connection-string";
const { parse } = pgConnectionString;
import * as schema from "../shared/schema";

// Parse database connection string
const connectionConfig = parse(process.env.DATABASE_URL || "");

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: connectionConfig.host || process.env.PGHOST,
  port: connectionConfig.port ? parseInt(connectionConfig.port) : process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  user: connectionConfig.user || process.env.PGUSER,
  password: connectionConfig.password || process.env.PGPASSWORD,
  database: connectionConfig.database || process.env.PGDATABASE,
  ssl: false
});

// Create drizzle database instance with our schema
export const db = drizzle(pool, { schema });

// Function to test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}