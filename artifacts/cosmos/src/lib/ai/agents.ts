export interface AgentDefinition {
  name: string;
  emoji: string;
  role: string;
  domain: string;
  color: string;
  description: string;
  keywords: string[];
}

export const AGENTS: AgentDefinition[] = [
  {
    name: "Luffy",
    emoji: "🏴‍☠️",
    role: "Vision Captain",
    domain: "vision",
    color: "#ef4444",
    description: "Fuels your dreams and helps define your ultimate purpose.",
    keywords: ["goal", "dream", "purpose", "why", "mission", "ambition", "future", "vision", "passion"],
  },
  {
    name: "Zoro",
    emoji: "⚔️",
    role: "Execution Master",
    domain: "execution",
    color: "#22c55e",
    description: "Cuts through complexity to get things built and shipped.",
    keywords: ["code", "build", "debug", "logic", "implement", "technical", "error", "deploy", "program"],
  },
  {
    name: "Nami",
    emoji: "🗺️",
    role: "Strategy Navigator",
    domain: "finance",
    color: "#f59e0b",
    description: "Charts the financial course and manages resources.",
    keywords: ["budget", "plan", "resource", "cost", "money", "finance", "invest", "revenue", "roi"],
  },
  {
    name: "Robin",
    emoji: "📚",
    role: "Knowledge Sage",
    domain: "knowledge",
    color: "#a855f7",
    description: "Researches, synthesizes, and surfaces hidden insights.",
    keywords: ["research", "learn", "history", "insight", "study", "analyze", "understand", "knowledge"],
  },
  {
    name: "Franky",
    emoji: "🔧",
    role: "Systems Builder",
    domain: "builder",
    color: "#3b82f6",
    description: "Engineers systems, pipelines, and infrastructure.",
    keywords: ["build", "system", "automate", "pipeline", "infrastructure", "architect", "setup"],
  },
  {
    name: "Chopper",
    emoji: "🩺",
    role: "Health Guardian",
    domain: "health",
    color: "#ec4899",
    description: "Monitors wellbeing, energy, and mental health.",
    keywords: ["wellness", "sleep", "exercise", "mental", "health", "stress", "energy", "fitness"],
  },
  {
    name: "Brook",
    emoji: "🎵",
    role: "Memory Keeper",
    domain: "memory",
    color: "#06b6d4",
    description: "Preserves stories, emotions, and nostalgic connections.",
    keywords: ["nostalgia", "story", "emotion", "past", "remember", "memory", "feel", "journal"],
  },
  {
    name: "Jinbe",
    emoji: "⚓",
    role: "Operations Commander",
    domain: "operations",
    color: "#64748b",
    description: "Builds routines, discipline, and sustainable processes.",
    keywords: ["routine", "discipline", "process", "daily", "habit", "schedule", "productive", "workflow"],
  },
  {
    name: "Sanji",
    emoji: "🍳",
    role: "Quality Chef",
    domain: "quality",
    color: "#eab308",
    description: "Reviews, audits, and refines to perfection.",
    keywords: ["review", "security", "audit", "test", "quality", "check", "validate", "improve", "polish"],
  },
  {
    name: "Usopp",
    emoji: "🎯",
    role: "Social Strategist",
    domain: "social",
    color: "#f97316",
    description: "Crafts narratives and builds social influence.",
    keywords: ["people", "communication", "strategy", "influence", "network", "community", "collaborate"],
  },
];

export function findAgentByDomain(domain: string): AgentDefinition {
  return AGENTS.find((a) => a.domain === domain) ?? AGENTS[3];
}

export function findAgentByName(name: string): AgentDefinition {
  return AGENTS.find((a) => a.name.toLowerCase() === name.toLowerCase()) ?? AGENTS[3];
}
