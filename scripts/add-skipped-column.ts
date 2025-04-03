import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function addSkippedColumn() {
  console.log("Adding 'skipped' column to interview_questions table...");
  
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {
    // Check if the column already exists
    const columnExists = await migrationClient`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'interview_questions'
      AND column_name = 'skipped'
    `;
    
    if (columnExists.length === 0) {
      // Add the column if it doesn't exist
      await migrationClient`
        ALTER TABLE interview_questions
        ADD COLUMN skipped BOOLEAN DEFAULT FALSE
      `;
      console.log("Column 'skipped' added successfully!");
    } else {
      console.log("Column 'skipped' already exists.");
    }
  } catch (error) {
    console.error("Error adding 'skipped' column:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

addSkippedColumn()
  .then(() => {
    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });