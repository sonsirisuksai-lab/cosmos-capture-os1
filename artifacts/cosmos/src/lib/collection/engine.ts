export interface CollectionEntry {
  id: number;
  name: string;
  description: string;
  color: string;
  noteCount: number;
  createdAt: string;
}

export interface CollectionFilter {
  search?: string;
  sortBy?: "name" | "noteCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export function filterCollections(
  collections: CollectionEntry[],
  filter: CollectionFilter
): CollectionEntry[] {
  let result = [...collections];

  if (filter.search) {
    const s = filter.search.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)
    );
  }

  const sortBy = filter.sortBy ?? "createdAt";
  const sortOrder = filter.sortOrder ?? "desc";

  result.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "noteCount") cmp = a.noteCount - b.noteCount;
    else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? -cmp : cmp;
  });

  return result;
}

export function getTotalNoteCount(collections: CollectionEntry[]): number {
  return collections.reduce((sum, c) => sum + c.noteCount, 0);
}
