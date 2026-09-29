import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const feedbackTable = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: varchar("category", { length: 20 }).notNull(),
  authorId: varchar("author_id").notNull().references(() => usersTable.id),
  authorName: varchar("author_name", { length: 150 }).notNull(),
  text: text("text").notNull(),
  imagePath: text("image_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("feedback_category_created_idx").on(table.category, table.createdAt)]);

export const feedbackUploadsTable = pgTable("feedback_uploads", {
  objectPath: text("object_path").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => usersTable.id),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
}, (table) => [index("feedback_uploads_owner_created_idx").on(table.ownerId, table.createdAt)]);