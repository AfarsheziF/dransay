#!/usr/bin/env node
import { execSync } from "child_process";

// Minimal migration runner used by the package.json script `db:migrate`.
// It simply invokes the locally-installed `drizzle-kit` binary via npx.
// Run with: `npm run db:migrate` (which calls `tsx src/db/migrate.ts`).

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn(
    "Warning: DATABASE_URL is not set. Make sure your environment provides it before running migrations."
  );
}

try {
  console.log("Running drizzle-kit migrate (via npx)...\n");
  // Use shell:true to make this work across platforms (including Windows cmd.exe)
  // execSync types are picky in TS; cast options to `any` for this small script.
  execSync("npx drizzle-kit migrate", { stdio: "inherit", shell: true } as any);
  console.log("Migration command finished.");
} catch (err) {
  console.error("Migration command failed:", err);
  process.exit(1);
}
