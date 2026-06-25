import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { eq, desc, like, sql } from "drizzle-orm";
import {
  ListNotesQueryParams,
  CreateNoteBody,
  UpdateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  DeleteNoteParams,
  ToggleNoteStarParams,
  GetRecentNotesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListNotesQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query" });
  const { tag, search, type } = query.data;

  let results = await db.select().from(notesTable).orderBy(desc(notesTable.updatedAt));

  if (type) results = results.filter((n) => n.type === type);
  if (tag) results = results.filter((n) => (n.tags as string[]).includes(tag));
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s)
    );
  }
  return res.json(results);
});

router.post("/", async (req, res) => {
  const body = CreateNoteBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const note = await db
    .insert(notesTable)
    .values({
      title: body.data.title,
      content: body.data.content ?? "",
      type: body.data.type ?? "note",
      tags: body.data.tags ?? [],
      agentName: body.data.agentName ?? null,
    })
    .returning();
  return res.status(201).json(note[0]);
});

router.get("/recent", async (req, res) => {
  const query = GetRecentNotesQueryParams.safeParse(req.query);
  const limit = query.success && query.data.limit ? query.data.limit : 10;
  const notes = await db.select().from(notesTable).orderBy(desc(notesTable.updatedAt)).limit(limit);
  return res.json(notes);
});

router.get("/starred", async (_req, res) => {
  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.starred, true))
    .orderBy(desc(notesTable.updatedAt));
  return res.json(notes);
});

router.get("/:id", async (req, res) => {
  const params = GetNoteParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const note = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!note.length) return res.status(404).json({ error: "Not found" });
  return res.json(note[0]);
});

router.patch("/:id", async (req, res) => {
  const params = UpdateNoteParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const body = UpdateNoteBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });

  const updated = await db
    .update(notesTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(notesTable.id, params.data.id))
    .returning();
  if (!updated.length) return res.status(404).json({ error: "Not found" });
  return res.json(updated[0]);
});

router.delete("/:id", async (req, res) => {
  const params = DeleteNoteParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));
  return res.status(204).send();
});

router.patch("/:id/star", async (req, res) => {
  const params = ToggleNoteStarParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const note = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!note.length) return res.status(404).json({ error: "Not found" });
  const updated = await db
    .update(notesTable)
    .set({ starred: !note[0].starred, updatedAt: new Date() })
    .where(eq(notesTable.id, params.data.id))
    .returning();
  return res.json(updated[0]);
});

export default router;
