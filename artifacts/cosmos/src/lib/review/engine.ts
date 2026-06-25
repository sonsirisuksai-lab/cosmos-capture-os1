export interface ReviewItem {
  noteId: number;
  title: string;
  scheduledAt: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  quality?: number;
}

export interface ReviewSession {
  id: string;
  items: ReviewItem[];
  startedAt: Date;
  completedAt?: Date;
  score: number;
}

export function scheduleReview(noteId: number, title: string): ReviewItem {
  return {
    noteId,
    title,
    scheduledAt: new Date(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
  };
}

export function processReview(item: ReviewItem, quality: number): ReviewItem {
  const q = Math.max(0, Math.min(5, quality));
  let { interval, easeFactor, repetitions } = item;

  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + interval);

  return { ...item, interval, easeFactor, repetitions, scheduledAt, quality: q };
}

export function getDueItems(items: ReviewItem[]): ReviewItem[] {
  const now = new Date();
  return items.filter((item) => item.scheduledAt <= now);
}

export function calculateRetention(items: ReviewItem[]): number {
  if (items.length === 0) return 0;
  const reviewed = items.filter((i) => i.repetitions > 0);
  return reviewed.length / items.length;
}
