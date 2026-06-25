import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable, orchestrateHistoryTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { OrchestrateBody, GetOrchestrateHistoryQueryParams } from "@workspace/api-zod";
import { routeAgent, generateMockResponse, generateSuggestions } from "../lib/orchestrator.js";

const router = Router();

router.post("/", async (req, res) => {
  const body = OrchestrateBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });

  const { prompt, saveToNotes } = body.data;
  const agent = routeAgent(prompt);
  const response = generateMockResponse(agent, prompt);
  const suggestions = generateSuggestions(agent, prompt);

  await db.insert(orchestrateHistoryTable).values({
    prompt,
    agentName: agent.name,
    agentEmoji: agent.emoji,
    response,
    domain: agent.domain,
  });

  let noteId: number | null = null;
  if (saveToNotes) {
    const note = await db
      .insert(notesTable)
      .values({
        title: `${agent.emoji} ${agent.name}: ${prompt.slice(0, 60)}`,
        content: response,
        type: "agent_reply",
        tags: [agent.domain, agent.name.toLowerCase()],
        agentName: agent.name,
        confidence: 0.9,
      })
      .returning();
    noteId = note[0].id;
  }

  return res.json({
    agentName: agent.name,
    agentEmoji: agent.emoji,
    response,
    domain: agent.domain,
    suggestions,
    noteId,
  });
});

router.get("/history", async (req, res) => {
  const query = GetOrchestrateHistoryQueryParams.safeParse(req.query);
  const limit = query.success && query.data.limit ? query.data.limit : 20;
  const history = await db
    .select()
    .from(orchestrateHistoryTable)
    .orderBy(desc(orchestrateHistoryTable.createdAt))
    .limit(limit);
  return res.json(history);
});

export default router;
