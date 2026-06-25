export interface TimelineEntry {
  id: number;
  type: string;
  title: string;
  description: string;
  agentName?: string | null;
  noteId?: number | null;
  createdAt: string;
}

export interface TimelineGroup {
  date: string;
  label: string;
  entries: TimelineEntry[];
}

export const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  note_created: { label: "Note Created", color: "#6366f1", icon: "📝" },
  note_updated: { label: "Note Updated", color: "#8b5cf6", icon: "✏️" },
  agent_interaction: { label: "Agent Interaction", color: "#f59e0b", icon: "🤖" },
  twin_update: { label: "Twin Updated", color: "#22c55e", icon: "👤" },
  collection_created: { label: "Collection Created", color: "#3b82f6", icon: "📁" },
  system_event: { label: "System Event", color: "#64748b", icon: "⚙️" },
};

export function groupTimelineByDate(entries: TimelineEntry[]): TimelineGroup[] {
  const groups = new Map<string, TimelineEntry[]>();

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const key = date.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return Array.from(groups.entries()).map(([dateStr, items]) => ({
    date: dateStr,
    label: dateStr === today ? "Today" : dateStr === yesterday ? "Yesterday" : dateStr,
    entries: items,
  }));
}

export function filterTimeline(entries: TimelineEntry[], type?: string): TimelineEntry[] {
  if (!type) return entries;
  return entries.filter((e) => e.type === type);
}
