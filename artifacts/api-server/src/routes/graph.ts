import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/nodes", async (_req, res) => {
  const notes = await db.select().from(notesTable).orderBy(desc(notesTable.updatedAt));

  const nodes = notes.map((note) => ({
    id: String(note.id),
    label: note.title.slice(0, 40),
    type: note.type,
    weight: note.confidence + note.reuseCount * 0.1,
    tags: note.tags as string[],
  }));

  const edges: Array<{ source: string; target: string; weight: number }> = [];
  for (const note of notes) {
    const linked = note.linkedNoteIds as number[];
    for (const targetId of linked) {
      const exists = notes.find((n) => n.id === targetId);
      if (exists) {
        edges.push({ source: String(note.id), target: String(targetId), weight: 1 });
      }
    }
  }

  return res.json({ nodes, edges });
});

router.get("/analytics", async (_req, res) => {
  const notes = await db.select().from(notesTable);
  const total = notes.length;

  const orphans = notes.filter((n) => (n.linkedNoteIds as number[]).length === 0);
  const totalLinks = notes.reduce((acc, n) => acc + (n.linkedNoteIds as number[]).length, 0);
  const density = total > 1 ? totalLinks / (total * (total - 1)) : 0;
  const connectivity = total > 0 ? (total - orphans.length) / total : 0;

  const tagFreq: Record<string, number> = {};
  for (const note of notes) {
    for (const tag of note.tags as string[]) {
      tagFreq[tag] = (tagFreq[tag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const topNodes = notes
    .sort((a, b) => b.confidence + b.reuseCount * 0.1 - (a.confidence + a.reuseCount * 0.1))
    .slice(0, 5)
    .map((n) => ({
      id: String(n.id),
      label: n.title.slice(0, 40),
      type: n.type,
      weight: n.confidence + n.reuseCount * 0.1,
      tags: n.tags as string[],
    }));

  const agentDomains = new Set(notes.map((n) => n.agentName).filter(Boolean));
  const knowledgeGaps = ["execution", "finance", "health", "operations"].filter(
    (d) => !notes.some((n) => (n.tags as string[]).includes(d))
  );

  const uniqueTypes = [...new Set(notes.map((n) => n.type))];
  const clusterCount = Math.max(uniqueTypes.length, Math.ceil(total / 5));

  return res.json({
    density: Math.min(density, 1),
    orphanCount: orphans.length,
    clusterCount,
    connectivity,
    topNodes,
    emergingTopics: sortedTags.slice(0, 5),
    knowledgeGaps: knowledgeGaps.slice(0, 3),
  });
});

export default router;
