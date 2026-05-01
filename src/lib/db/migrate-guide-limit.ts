import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding guide_call_count and guide_call_day_key columns...");
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS guide_call_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS guide_call_day_key TEXT;
  `);
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
