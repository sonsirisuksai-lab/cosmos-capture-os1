import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orchestrateHistoryTable = pgTable("orchestrate_history", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  agentName: text("agent_name").notNull(),
  agentEmoji: text("agent_emoji").notNull(),
  response: text("response").notNull(),
  domain: text("domain").notNull().default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrchestrateHistorySchema = createInsertSchema(orchestrateHistoryTable).omit({ id: true, createdAt: true });
export type InsertOrchestrateHistory = z.infer<typeof insertOrchestrateHistorySchema>;
export type OrchestrateHistory = typeof orchestrateHistoryTable.$inferSelect;
