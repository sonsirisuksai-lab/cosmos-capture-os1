export interface TwinMetrics {
  totalNotes: number;
  totalInteractions: number;
  knowledgeScore: number;
  energyLevel: number;
  graphDensity: number;
  dominantDomain: string;
}

export interface TwinState {
  status: "active" | "idle" | "evolving" | "dormant";
  currentFocus: string;
  lastActivity: Date;
  sessionDepth: number;
}

export interface TwinMemory {
  id: string;
  type: "insight" | "emotion" | "achievement" | "question";
  content: string;
  timestamp: Date;
  importance: number;
}

export interface TwinBehavior {
  preferredDomain: string;
  activityPattern: "morning" | "evening" | "irregular";
  knowledgeStyle: "breadth" | "depth" | "mixed";
  interactionFrequency: number;
}

export interface TwinProfile {
  id: number;
  name: string;
  role: string;
  metrics: TwinMetrics;
  state: TwinState;
  memories: TwinMemory[];
  behavior: TwinBehavior;
  focusAreas: string[];
  lastActive: string;
}

export function buildTwinProfile(
  raw: {
    id: number;
    name: string;
    role: string;
    totalNotes: number;
    totalInteractions: number;
    dominantDomain: string;
    energyLevel: number;
    knowledgeScore: number;
    focusAreas: string[];
    lastActive: string;
  }
): TwinProfile {
  const lastActiveDate = new Date(raw.lastActive);
  const hoursSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60);
  const status: TwinState["status"] =
    hoursSinceActive < 1 ? "active" : hoursSinceActive < 24 ? "idle" : "dormant";

  return {
    id: raw.id,
    name: raw.name,
    role: raw.role,
    metrics: {
      totalNotes: raw.totalNotes,
      totalInteractions: raw.totalInteractions,
      knowledgeScore: raw.knowledgeScore,
      energyLevel: raw.energyLevel,
      graphDensity: 0,
      dominantDomain: raw.dominantDomain,
    },
    state: {
      status,
      currentFocus: raw.dominantDomain,
      lastActivity: lastActiveDate,
      sessionDepth: Math.min(Math.floor(raw.totalInteractions / 5), 10),
    },
    memories: [],
    behavior: {
      preferredDomain: raw.dominantDomain,
      activityPattern: "irregular",
      knowledgeStyle: raw.totalNotes > 50 ? "depth" : "breadth",
      interactionFrequency: raw.totalInteractions,
    },
    focusAreas: raw.focusAreas,
    lastActive: raw.lastActive,
  };
}

export function getTwinStateLabel(state: TwinState): string {
  const labels: Record<TwinState["status"], string> = {
    active: "Online",
    idle: "Standby",
    evolving: "Evolving",
    dormant: "Sleeping",
  };
  return labels[state.status];
}

export function getTwinEnergyColor(level: number): string {
  if (level >= 0.8) return "#22c55e";
  if (level >= 0.5) return "#f59e0b";
  return "#ef4444";
}
