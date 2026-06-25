import { pgTable, serial, text, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const twinProfileTable = pgTable("twin_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Cosmos Thinker"),
  role: text("role").notNull().default("Knowledge Explorer"),
  dominantDomain: text("dominant_domain").notNull().default("general"),
  energyLevel: real("energy_level").notNull().default(0.75),
  knowledgeScore: real("knowledge_score").notNull().default(0),
  focusAreas: jsonb("focus_areas").$type<string[]>().notNull().default([]),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTwinProfileSchema = createInsertSchema(twinProfileTable).omit({ id: true, createdAt: true });
export type InsertTwinProfile = z.infer<typeof insertTwinProfileSchema>;
export type TwinProfile = typeof twinProfileTable.$inferSelect;
