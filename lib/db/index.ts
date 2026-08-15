import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_dbInstance) return _dbInstance;
  const url = process.env.DATABASE_URL;
  if (!url || (!url.startsWith("postgres://") && !url.startsWith("postgresql://"))) {
    return null;
  }
  try {
    const sql = neon(url);
    _dbInstance = drizzle(sql, { schema });
    return _dbInstance;
  } catch (e) {
    console.warn("Could not connect to Neon database:", e);
    return null;
  }
}

// Fallback proxy that safely handles db calls
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (instance as any)[prop];
  },
});

export const hasValidDb = Boolean(
  process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
);

export * from "./schema";
