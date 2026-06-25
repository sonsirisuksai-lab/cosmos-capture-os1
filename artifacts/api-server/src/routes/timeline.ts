import { Router } from "express";
import { db } from "@workspace/db";
import { timelineEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetTimelineQueryParams, CreateTimelineEventBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = GetTimelineQueryParams.safeParse(req.query);
  const limit = query.success && query.data.limit ? query.data.limit : 50;
  const type = query.success ? query.data.type : undefined;

  let results = await db
    .select()
    .from(timelineEventsTable)
    .orderBy(desc(timelineEventsTable.createdAt))
    .limit(limit);

  if (type) results = results.filter((e) => e.type === type);
  return res.json(results);
});

router.post("/", async (req, res) => {
  const body = CreateTimelineEventBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });

  const event = await db
    .insert(timelineEventsTable)
    .values({
      type: body.data.type,
      title: body.data.title,
      description: body.data.description,
      agentName: body.data.agentName ?? null,
      noteId: body.data.noteId ?? null,
    })
    .returning();
  return res.status(201).json(event[0]);
});

export default router;
