import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  uuid,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  targetBand: numeric("target_band", { precision: 2, scale: 1 }).default(
    "7.0"
  ),
  currentBand: numeric("current_band", { precision: 2, scale: 1 }),
  totalEssays: integer("total_essays").default(0),
  plan: text("plan").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planExpiresAt: timestamp("plan_expires_at", { mode: "date" }),
  promptCount: integer("prompt_count").default(0),
  promptMonthKey: text("prompt_month_key"), // "YYYY-MM"
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

export const essays = pgTable("essays", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskType: text("task_type").notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull(),
  submittedAt: timestamp("submitted_at", { mode: "date" }).defaultNow(),
  overallBand: numeric("overall_band", { precision: 2, scale: 1 }),
  taskAchievement: numeric("task_achievement", { precision: 2, scale: 1 }),
  coherenceCohesion: numeric("coherence_cohesion", { precision: 2, scale: 1 }),
  lexicalResource: numeric("lexical_resource", { precision: 2, scale: 1 }),
  grammaticalRange: numeric("grammatical_range", { precision: 2, scale: 1 }),
  feedbackSummary: text("feedback_summary"),
  detailedFeedback: jsonb("detailed_feedback"),
  examinerComments: text("examiner_comments"),
  sampleEssay: text("sample_essay"),
});

export const errorPatterns = pgTable("error_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  errorType: text("error_type").notNull(),
  errorCategory: text("error_category").notNull(),
  description: text("description").notNull(),
  frequency: integer("frequency").default(1),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }).defaultNow(),
  firstSeenAt: timestamp("first_seen_at", { mode: "date" }).defaultNow(),
  examples: jsonb("examples").$type<
    Array<{ essayId: string; text: string; correction: string }>
  >(),
});

export const vocabularyStats = pgTable("vocabulary_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  frequency: integer("frequency").default(1),
  isOverused: boolean("is_overused").default(false),
  context: text("context"),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }).defaultNow(),
});

export const studentMemory = pgTable("student_memory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  grammarProfile: jsonb("grammar_profile"),
  vocabularyProfile: jsonb("vocabulary_profile"),
  structureProfile: jsonb("structure_profile"),
  scoringTrends: jsonb("scoring_trends"),
  strengthAreas: jsonb("strength_areas").$type<string[]>(),
  weaknessAreas: jsonb("weakness_areas").$type<string[]>(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseType: text("exercise_type").notNull(),
  targetError: text("target_error").notNull(),
  content: jsonb("content"),
  isCompleted: boolean("is_completed").default(false),
  score: integer("score"),
  generatedAt: timestamp("generated_at", { mode: "date" }).defaultNow(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  essays: many(essays),
  errorPatterns: many(errorPatterns),
  vocabularyStats: many(vocabularyStats),
  studentMemory: one(studentMemory),
  exercises: many(exercises),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const essaysRelations = relations(essays, ({ one }) => ({
  user: one(users, { fields: [essays.userId], references: [users.id] }),
}));

export const errorPatternsRelations = relations(errorPatterns, ({ one }) => ({
  user: one(users, { fields: [errorPatterns.userId], references: [users.id] }),
}));

export const vocabularyStatsRelations = relations(
  vocabularyStats,
  ({ one }) => ({
    user: one(users, {
      fields: [vocabularyStats.userId],
      references: [users.id],
    }),
  })
);

export const studentMemoryRelations = relations(studentMemory, ({ one }) => ({
  user: one(users, { fields: [studentMemory.userId], references: [users.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  user: one(users, { fields: [exercises.userId], references: [users.id] }),
}));
