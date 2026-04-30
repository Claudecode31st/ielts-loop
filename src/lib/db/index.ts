import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create a lazy db instance that connects on first use
// We use a dummy URL during build time and the real one at runtime
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || "postgresql://user:pass@host/db";
};

const sql = neon(getDatabaseUrl());
export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });
