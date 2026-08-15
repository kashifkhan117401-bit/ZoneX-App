import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
    const match = envFile.match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      dbUrl = match[1].trim();
    }
  } catch {
    // ignore
  }
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl || "",
  },
});
