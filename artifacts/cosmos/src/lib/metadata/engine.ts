export interface NoteMetadata {
  id: number;
  wordCount: number;
  readingTime: number;
  complexity: "simple" | "moderate" | "complex";
  language: string;
  sentiment: "positive" | "neutral" | "negative";
  entities: string[];
}

export function extractMetadata(noteId: number, content: string): NoteMetadata {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200);

  const complexity: NoteMetadata["complexity"] =
    wordCount < 50 ? "simple" : wordCount < 200 ? "moderate" : "complex";

  const positiveWords = ["great", "good", "excellent", "love", "amazing", "success", "achieve", "win"];
  const negativeWords = ["bad", "fail", "error", "problem", "issue", "difficult", "hard", "wrong"];
  const lower = content.toLowerCase();
  const posScore = positiveWords.filter((w) => lower.includes(w)).length;
  const negScore = negativeWords.filter((w) => lower.includes(w)).length;
  const sentiment: NoteMetadata["sentiment"] =
    posScore > negScore ? "positive" : negScore > posScore ? "negative" : "neutral";

  const entityPatterns = [/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g];
  const entities: string[] = [];
  for (const pattern of entityPatterns) {
    const matches = content.match(pattern) ?? [];
    entities.push(...matches.slice(0, 5));
  }

  return {
    id: noteId,
    wordCount,
    readingTime,
    complexity,
    language: "en",
    sentiment,
    entities: [...new Set(entities)].slice(0, 10),
  };
}

export function getReadingTimeLabel(minutes: number): string {
  if (minutes < 1) return "< 1 min read";
  return `${minutes} min read`;
}
