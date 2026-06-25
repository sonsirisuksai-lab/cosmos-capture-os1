export interface QueryFilter {
  type?: string;
  tags?: string[];
  starred?: boolean;
  agentName?: string;
  search?: string;
  minConfidence?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface QueryResult<T> {
  items: T[];
  total: number;
  filtered: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NoteQueryItem {
  id: number;
  title: string;
  content: string;
  type: string;
  tags: string[];
  starred: boolean;
  confidence: number;
  agentName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function applyFilters(notes: NoteQueryItem[], filter: QueryFilter): NoteQueryItem[] {
  return notes.filter((note) => {
    if (filter.type && note.type !== filter.type) return false;
    if (filter.starred !== undefined && note.starred !== filter.starred) return false;
    if (filter.agentName && note.agentName !== filter.agentName) return false;
    if (filter.minConfidence !== undefined && note.confidence < filter.minConfidence) return false;
    if (filter.tags?.length) {
      const hasAll = filter.tags.every((t) => note.tags.includes(t));
      if (!hasAll) return false;
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      const inTitle = note.title.toLowerCase().includes(s);
      const inContent = note.content.toLowerCase().includes(s);
      const inTags = note.tags.some((t) => t.toLowerCase().includes(s));
      if (!inTitle && !inContent && !inTags) return false;
    }
    if (filter.dateFrom && new Date(note.createdAt) < filter.dateFrom) return false;
    if (filter.dateTo && new Date(note.createdAt) > filter.dateTo) return false;
    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): QueryResult<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return {
    items: pageItems,
    total,
    filtered: total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}
