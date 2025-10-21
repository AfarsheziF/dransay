#!/usr/bin/env node
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Migration runner for production deployment
// Run with: `npm run db:migrate` (which calls `tsx src/db/migrate.ts`).

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error(
    "Error: DATABASE_URL environment variable is required for migrations."
  );
  process.exit(1);
}

// TypeScript now knows dbUrl is defined
const connectionString: string = dbUrl;

async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  
  // Create connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    // Check if it's just "no migrations to run"
    if (error instanceof Error && error.message.includes("No migrations found")) {
      console.log("ℹ️ No migrations to run - database is up to date");
      return;
    }
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}runMigrations().catch((err) => {
  console.error("❌ Migration runner failed:", err);
  process.exit(1);
});
