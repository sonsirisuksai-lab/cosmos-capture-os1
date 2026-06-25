// test-legacy.ts — Test Legacy Engine
// Run: pnpm --filter @workspace/cosmos test:legacy

import { generateLegacyBook, getAllLegacyBooks, addChapter, exportBookAsMarkdown } from "../src/lib/legacy/engine";

async function testLegacy() {
  console.log("\n📜 ===== Testing Legacy Engine =====\n");

  // Generate a legacy book
  console.log("🔨 Generating Legacy Book for 'test-user'...");
  const book = await generateLegacyBook("test-user");
  console.log(`📖 Created: "${book.title}"`);
  console.log(`📚 Chapters: ${book.chapters.length}`);
  console.log(`👤 Owner: ${book.owner}`);

  // Show first chapter
  const chapter = book.chapters[0];
  if (chapter) {
    console.log(`\n📄 Chapter: "${chapter.title}" (${chapter.period})`);
    console.log(`  Stories: ${chapter.stories.length}`);
    console.log(`  Lessons: ${chapter.lessons.length}`);
    console.log(`  Beliefs: ${chapter.beliefs.length}`);
  }

  // Add another chapter
  console.log("\n➕ Adding a new chapter...");
  const updated = await addChapter(book.id, {
    title: "The Builder Phase",
    period: "2026",
    stories: ["Built COSMOS-CAPTURE-OS from scratch.", "Launched the Universe Engine."],
    lessons: ["Systems beat motivation.", "Start before you're ready."],
    beliefs: ["The best time to start was yesterday."],
    photos: [],
    soulCardIds: [],
  });
  console.log(`✅ Book now has ${updated?.chapters.length} chapters`);

  // Export
  console.log("\n📝 Exporting book as Markdown...");
  if (updated) {
    const md = exportBookAsMarkdown(updated);
    console.log(`Preview (first 500 chars):\n${md.slice(0, 500)}...`);
  }

  // List all books
  const allBooks = await getAllLegacyBooks();
  console.log(`\n📚 Total legacy books: ${allBooks.length}`);

  console.log("\n✨ Legacy test complete!\n");
}

testLegacy().catch(console.error);
