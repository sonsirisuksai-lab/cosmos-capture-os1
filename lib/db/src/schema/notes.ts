import { pgTable, serial, text, boolean, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  type: text("type").notNull().default("note"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  starred: boolean("starred").notNull().default(false),
  confidence: real("confidence").notNull().default(0.8),
  reuseCount: integer("reuse_count").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  linkedNoteIds: jsonb("linked_note_ids").$type<number[]>().notNull().default([]),
  agentName: text("agent_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
