import type { LegacyBook, LegacyChapter } from "./types";
import { saveEntry, getAllEntries } from "../storage/indexeddb";

const ENTRY_TYPE = "legacy";

export async function getAllLegacyBooks(): Promise<LegacyBook[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  return stored.map((e) => e.data as LegacyBook);
}

export async function getLegacyBook(id: string): Promise<LegacyBook | null> {
  const all = await getAllLegacyBooks();
  return all.find((b) => b.id === id) ?? null;
}

export async function generateLegacyBook(owner: string): Promise<LegacyBook> {
  const memoryEntries = await getAllEntries("memory");
  const soulEntries = await getAllEntries("soul");

  const memories = memoryEntries.map((e) => e.data as any);
  const souls = soulEntries.map((e) => e.data as any);

  const lessons = memories.filter((m) => m.tags?.includes("lesson")).map((m) => m.content ?? "");
  const stories = memories.filter((m) => m.type === "episodic").map((m) => m.content ?? "");

  const now = new Date();
  const period = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

  const chapter: LegacyChapter = {
    id: crypto.randomUUID(),
    title: "The Beginning",
    period,
    stories: stories.length ? stories.slice(0, 5) : ["The journey of COSMOS begins here."],
    lessons: lessons.length ? lessons.slice(0, 3) : ["Build systems, not goals.", "Consistency beats intensity."],
    beliefs: ["Every day is a new universe.", "Knowledge is the ultimate legacy."],
    photos: [],
    soulCardIds: souls.map((s) => s.id ?? ""),
    createdAt: Date.now(),
  };

  const book: LegacyBook = {
    id: crypto.randomUUID(),
    title: `${owner}'s Legacy Book`,
    owner,
    chapters: [chapter],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveEntry({ id: book.id, type: ENTRY_TYPE, data: book, timestamp: book.createdAt });
  return book;
}

export async function addChapter(
  bookId: string,
  chapter: Omit<LegacyChapter, "id" | "createdAt">
): Promise<LegacyBook | null> {
  const book = await getLegacyBook(bookId);
  if (!book) return null;
  const newChapter: LegacyChapter = { id: crypto.randomUUID(), ...chapter, createdAt: Date.now() };
  const updated: LegacyBook = {
    ...book,
    chapters: [...book.chapters, newChapter],
    updatedAt: Date.now(),
  };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  return updated;
}

export function exportBookAsMarkdown(book: LegacyBook): string {
  let md = `# 📜 ${book.title}\n\n`;
  md += `> Owner: ${book.owner} | Created: ${new Date(book.createdAt).toLocaleDateString()}\n\n`;
  for (const chapter of book.chapters) {
    md += `## ${chapter.title} (${chapter.period})\n\n`;
    if (chapter.stories.length) {
      md += `### Stories\n${chapter.stories.map((s) => `- ${s}`).join("\n")}\n\n`;
    }
    if (chapter.lessons.length) {
      md += `### Lessons\n${chapter.lessons.map((l) => `- ${l}`).join("\n")}\n\n`;
    }
    if (chapter.beliefs.length) {
      md += `### Beliefs\n${chapter.beliefs.map((b) => `- ${b}`).join("\n")}\n\n`;
    }
  }
  return md;
}
