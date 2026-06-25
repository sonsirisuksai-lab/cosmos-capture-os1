export type UniverseMode = "active" | "dormant" | "hidden";

export interface Universe {
  id: string;
  name: string;
  description: string;
  icon: string;
  mood: string;
  theme: string;
  status: UniverseMode;
  order: number;
  config: {
    defaultTab: string;
    showStats: string[];
    colorPalette: { primary: string; accent: string; background: string };
  };
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_UNIVERSES: Omit<Universe, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Life",
    description: "Personal growth, health, relationships",
    icon: "🌌",
    mood: "calm",
    theme: "cosmic",
    status: "active",
    order: 0,
    config: {
      defaultTab: "dashboard",
      showStats: ["mood", "streak", "memories"],
      colorPalette: { primary: "#7c3aed", accent: "#00d4ff", background: "#0a0a1a" },
    },
  },
  {
    name: "Work",
    description: "Projects, tasks, career",
    icon: "💼",
    mood: "focused",
    theme: "minimal",
    status: "active",
    order: 1,
    config: {
      defaultTab: "projects",
      showStats: ["projects", "tasks", "milestones"],
      colorPalette: { primary: "#f97316", accent: "#3b82f6", background: "#0f172a" },
    },
  },
  {
    name: "Knowledge",
    description: "Learning, research, concepts",
    icon: "📚",
    mood: "intense",
    theme: "cosmic",
    status: "active",
    order: 2,
    config: {
      defaultTab: "knowledge",
      showStats: ["notes", "concepts", "confidence"],
      colorPalette: { primary: "#22d3ee", accent: "#8b5cf6", background: "#0a0a1a" },
    },
  },
  {
    name: "Legacy",
    description: "Memories, stories, values",
    icon: "🏛️",
    mood: "hopeful",
    theme: "warm",
    status: "dormant",
    order: 3,
    config: {
      defaultTab: "memories",
      showStats: ["memories", "souls", "stories"],
      colorPalette: { primary: "#f59e0b", accent: "#ef4444", background: "#1a0a0a" },
    },
  },
];
