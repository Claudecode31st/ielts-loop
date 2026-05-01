import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running sample_essay migration…");
  await db.execute(
    sql`ALTER TABLE essays ADD COLUMN IF NOT EXISTS sample_essay text`
  );
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
