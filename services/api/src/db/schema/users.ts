// All timestamps are stored in UTC. Column type is `timestamp` (without
// timezone); the database receives and returns UTC values — callers must not
// pass local-time strings.
//
// WHY: This is a minimal bootstrap table whose sole purpose is to prove the
// migration pipeline. FND-014 owns the authoritative Better Auth schema and
// will reconcile against (or supersede) this table with a follow-up migration.
import { boolean, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
