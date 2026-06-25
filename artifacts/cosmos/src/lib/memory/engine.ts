export interface MemoryEntry {
  id: string;
  type: "episodic" | "semantic" | "procedural" | "emotional";
  content: string;
  tags: string[];
  importance: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface MemoryIndex {
  entries: MemoryEntry[];
  totalSize: number;
  lastConsolidated: Date;
}

export function createMemoryEntry(
  type: MemoryEntry["type"],
  content: string,
  tags: string[] = [],
  importance: number = 0.5
): MemoryEntry {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    tags,
    importance,
    createdAt: new Date(),
    lastAccessed: new Date(),
    accessCount: 0,
  };
}

export function accessMemory(entry: MemoryEntry): MemoryEntry {
  return { ...entry, lastAccessed: new Date(), accessCount: entry.accessCount + 1 };
}

export function consolidateMemories(entries: MemoryEntry[]): MemoryEntry[] {
  return entries
    .filter((e) => e.importance > 0.3 || e.accessCount > 2)
    .sort((a, b) => b.importance - a.importance);
}

export function searchMemories(entries: MemoryEntry[], query: string): MemoryEntry[] {
  const lower = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.content.toLowerCase().includes(lower) ||
      e.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

export function calculateMemoryDecay(entry: MemoryEntry): number {
  const daysSinceAccess =
    (Date.now() - entry.lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
  const decayRate = 0.1;
  return Math.max(entry.importance * Math.exp(-decayRate * daysSinceAccess), 0.1);
}
