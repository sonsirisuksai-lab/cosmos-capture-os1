import { Router } from "express";
import { db } from "@workspace/db";
import { collectionsTable, notesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { CreateCollectionBody, DeleteCollectionParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const collections = await db
    .select()
    .from(collectionsTable)
    .orderBy(desc(collectionsTable.createdAt));

  const results = await Promise.all(
    collections.map(async (c) => {
      const [nc] = await db.select({ count: count() }).from(notesTable);
      return { ...c, noteCount: Math.floor(nc.count / Math.max(collections.length, 1)) };
    })
  );
  return res.json(results);
});

router.post("/", async (req, res) => {
  const body = CreateCollectionBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });

  const collection = await db
    .insert(collectionsTable)
    .values({
      name: body.data.name,
      description: body.data.description ?? "",
      color: body.data.color ?? "#6366f1",
    })
    .returning();
  return res.status(201).json({ ...collection[0], noteCount: 0 });
});

router.delete("/:id", async (req, res) => {
  const params = DeleteCollectionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(collectionsTable).where(eq(collectionsTable.id, params.data.id));
  return res.status(204).send();
});

export default router;
