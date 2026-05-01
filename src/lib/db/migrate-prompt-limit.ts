import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running prompt limit migration…");
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS prompt_count integer DEFAULT 0`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS prompt_month_key text`);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
