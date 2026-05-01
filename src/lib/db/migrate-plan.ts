import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running plan migration…");

  await db.execute(
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free'`
  );
  await db.execute(
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text`
  );
  await db.execute(
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text`
  );
  await db.execute(
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at timestamp`
  );

  console.log("Plan migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
