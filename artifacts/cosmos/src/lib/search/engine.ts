export interface SearchResult {
  id: number;
  title: string;
  content: string;
  type: string;
  tags: string[];
  score: number;
  highlights: string[];
}

export interface SearchOptions {
  fuzzy?: boolean;
  fields?: ("title" | "content" | "tags")[];
  limit?: number;
}

export function highlightMatches(text: string, query: string): string {
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "**$1**");
}

export function scoreMatch(item: { title: string; content: string; tags: string[] }, query: string): number {
  const lower = query.toLowerCase();
  let score = 0;

  if (item.title.toLowerCase().includes(lower)) score += 10;
  if (item.content.toLowerCase().includes(lower)) score += 5;
  if (item.tags.some((t) => t.toLowerCase().includes(lower))) score += 7;

  const wordMatches = lower.split(/\s+/).filter(Boolean).reduce((acc, word) => {
    if (item.title.toLowerCase().includes(word)) acc += 3;
    if (item.content.toLowerCase().includes(word)) acc += 1;
    return acc;
  }, 0);

  return score + wordMatches;
}

export function search<T extends { id: number; title: string; content: string; tags: string[] }>(
  items: T[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  if (!query.trim()) return [];

  const { limit = 20 } = options;
  const scored = items
    .map((item) => ({ item, score: scoreMatch(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ item, score }) => {
    const excerpt = item.content.slice(0, 200);
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      type: (item as Record<string, unknown>).type as string ?? "note",
      tags: item.tags,
      score,
      highlights: [highlightMatches(excerpt, query)],
    };
  });
}

export function extractTags(content: string): string[] {
  const tagPattern = /#(\w+)/g;
  const matches = content.match(tagPattern) ?? [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}
