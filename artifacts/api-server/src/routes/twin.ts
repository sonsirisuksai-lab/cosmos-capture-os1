import { Router } from "express";
import { db } from "@workspace/db";
import { twinProfileTable, notesTable, orchestrateHistoryTable } from "@workspace/db";
import { desc, count } from "drizzle-orm";
import { UpdateTwinProfileBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateTwin() {
  const existing = await db.select().from(twinProfileTable).limit(1);
  if (existing.length) return existing[0];
  const created = await db.insert(twinProfileTable).values({}).returning();
  return created[0];
}

router.get("/", async (_req, res) => {
  const twin = await getOrCreateTwin();
  const [noteCount] = await db.select({ count: count() }).from(notesTable);
  const [interactionCount] = await db.select({ count: count() }).from(orchestrateHistoryTable);

  const notes = await db.select().from(notesTable);
  const domainFreq: Record<string, number> = {};
  for (const note of notes) {
    const agent = note.agentName;
    if (agent) domainFreq[agent] = (domainFreq[agent] || 0) + 1;
  }
  const dominantDomain = Object.entries(domainFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "general";
  const knowledgeScore = Math.min((noteCount.count * 2 + interactionCount.count) / 100, 1);

  return res.json({
    id: twin.id,
    name: twin.name,
    role: twin.role,
    totalNotes: noteCount.count,
    totalInteractions: interactionCount.count,
    dominantDomain,
    energyLevel: twin.energyLevel,
    knowledgeScore,
    focusAreas: twin.focusAreas as string[],
    lastActive: twin.lastActive.toISOString(),
  });
});

router.patch("/", async (req, res) => {
  const body = UpdateTwinProfileBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });

  const twin = await getOrCreateTwin();
  const updated = await db
    .update(twinProfileTable)
    .set({ ...body.data, lastActive: new Date() })
    .returning();

  const [noteCount] = await db.select({ count: count() }).from(notesTable);
  const [interactionCount] = await db.select({ count: count() }).from(orchestrateHistoryTable);
  const knowledgeScore = Math.min((noteCount.count * 2 + interactionCount.count) / 100, 1);

  return res.json({
    ...updated[0],
    totalNotes: noteCount.count,
    totalInteractions: interactionCount.count,
    dominantDomain: "general",
    knowledgeScore,
    focusAreas: updated[0].focusAreas as string[],
    lastActive: updated[0].lastActive.toISOString(),
  });
});

export default router;
