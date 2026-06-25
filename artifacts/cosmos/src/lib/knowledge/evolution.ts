export interface KnowledgeSignals {
  confidence: number;
  relevance: number;
  freshness: number;
  importance: number;
  reuseCount: number;
  reviewCount: number;
}

export interface KnowledgeNote {
  id: number;
  title: string;
  content: string;
  type: string;
  tags: string[];
  starred: boolean;
  confidence: number;
  reuseCount: number;
  reviewCount: number;
  updatedAt: string;
}

export function calculateConfidence(note: KnowledgeNote): number {
  const base = note.confidence;
  const reuseBonus = Math.min(note.reuseCount * 0.05, 0.2);
  const reviewBonus = Math.min(note.reviewCount * 0.03, 0.15);
  return Math.min(base + reuseBonus + reviewBonus, 1.0);
}

export function calculateFreshness(note: KnowledgeNote): number {
  const updated = new Date(note.updatedAt).getTime();
  const now = Date.now();
  const daysSince = (now - updated) / (1000 * 60 * 60 * 24);
  if (daysSince < 1) return 1.0;
  if (daysSince < 7) return 0.9;
  if (daysSince < 30) return 0.7;
  if (daysSince < 90) return 0.5;
  return 0.3;
}

export function calculateRelevance(note: KnowledgeNote, context: string[]): number {
  const noteTerms = [...note.tags, ...note.title.toLowerCase().split(" ")];
  const matches = context.filter((term) =>
    noteTerms.some((nt) => nt.includes(term.toLowerCase()))
  );
  return Math.min(matches.length / Math.max(context.length, 1), 1.0);
}

export function detectKnowledgeDecay(note: KnowledgeNote): boolean {
  const freshness = calculateFreshness(note);
  const confidence = calculateConfidence(note);
  return freshness < 0.5 && confidence < 0.6 && note.reuseCount === 0;
}

export function promoteKnowledge(note: KnowledgeNote): boolean {
  const confidence = calculateConfidence(note);
  return confidence > 0.85 && note.reuseCount > 3;
}

export function evolveKnowledge(notes: KnowledgeNote[]): {
  decaying: KnowledgeNote[];
  promoting: KnowledgeNote[];
  healthy: KnowledgeNote[];
} {
  const decaying = notes.filter(detectKnowledgeDecay);
  const promoting = notes.filter(promoteKnowledge);
  const healthyIds = new Set([...decaying.map((n) => n.id), ...promoting.map((n) => n.id)]);
  const healthy = notes.filter((n) => !healthyIds.has(n.id));
  return { decaying, promoting, healthy };
}

export function archiveDeadKnowledge(notes: KnowledgeNote[]): KnowledgeNote[] {
  return notes.filter((n) => {
    const freshness = calculateFreshness(n);
    return freshness < 0.3 && n.reuseCount === 0 && n.reviewCount === 0;
  });
}
