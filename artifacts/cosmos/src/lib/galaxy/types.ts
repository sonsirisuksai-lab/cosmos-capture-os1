export interface Galaxy {
  id: string;
  name: string;
  description: string;
  icon: string;
  universeId: string;
  color: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_GALAXIES: Omit<Galaxy, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Health", description: "Physical and mental wellbeing", icon: "💪", universeId: "life", color: "#22c55e", order: 0 },
  { name: "Relationships", description: "Family, friends, connections", icon: "❤️", universeId: "life", color: "#ef4444", order: 1 },
  { name: "Projects", description: "Active work projects", icon: "🚀", universeId: "work", color: "#6366f1", order: 0 },
  { name: "Learning", description: "Courses, books, skills", icon: "📖", universeId: "knowledge", color: "#22d3ee", order: 0 },
  { name: "Concepts", description: "Ideas and mental models", icon: "💡", universeId: "knowledge", color: "#8b5cf6", order: 1 },
];
