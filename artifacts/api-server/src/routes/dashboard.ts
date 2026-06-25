import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable, orchestrateHistoryTable, timelineEventsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const notes = await db.select().from(notesTable);
  const [interactionCount] = await db.select({ count: count() }).from(orchestrateHistoryTable);

  const totalNotes = notes.length;
  const starredNotes = notes.filter((n) => n.starred).length;
  const totalLinks = notes.reduce((acc, n) => acc + (n.linkedNoteIds as number[]).length, 0);
  const density = totalNotes > 1 ? totalLinks / (totalNotes * (totalNotes - 1)) : 0;
  const knowledgeScore = Math.min((totalNotes * 2 + interactionCount.count) / 100, 1);

  const agentFreq: Record<string, number> = {};
  for (const note of notes) {
    if (note.agentName) {
      agentFreq[note.agentName] = (agentFreq[note.agentName] || 0) + 1;
    }
  }
  const topDomains = Object.entries(agentFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, c]) => ({ domain, count: c }));

  const typeFreq: Record<string, number> = {};
  for (const note of notes) {
    typeFreq[note.type] = (typeFreq[note.type] || 0) + 1;
  }
  const notesByType = Object.entries(typeFreq).map(([type, c]) => ({ type, count: c }));

  return res.json({
    totalNotes,
    starredNotes,
    totalInteractions: interactionCount.count,
    graphDensity: Math.min(density, 1),
    knowledgeScore,
    topDomains,
    notesByType,
  });
});

router.get("/activity", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const history = await db
    .select()
    .from(orchestrateHistoryTable)
    .orderBy(desc(orchestrateHistoryTable.createdAt))
    .limit(limit);

  const activity = history.map((h) => ({
    id: h.id,
    type: "agent_interaction",
    title: h.prompt.slice(0, 80),
    agentName: h.agentName,
    agentEmoji: h.agentEmoji,
    createdAt: h.createdAt.toISOString(),
  }));
  return res.json(activity);
});

export default router;
