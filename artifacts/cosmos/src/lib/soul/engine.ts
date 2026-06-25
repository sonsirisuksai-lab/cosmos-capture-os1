export interface SoulAttribute {
  name: string;
  value: number;
  maxValue: number;
  description: string;
}

export interface SoulCard {
  id: string;
  title: string;
  archetype: string;
  description: string;
  attributes: SoulAttribute[];
  dominantTrait: string;
  color: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface SoulState {
  energy: number;
  focus: number;
  creativity: number;
  wisdom: number;
  resilience: number;
}

const ARCHETYPES = [
  { name: "The Visionary", trait: "vision", color: "#ef4444" },
  { name: "The Builder", trait: "execution", color: "#3b82f6" },
  { name: "The Scholar", trait: "knowledge", color: "#a855f7" },
  { name: "The Strategist", trait: "finance", color: "#f59e0b" },
  { name: "The Healer", trait: "health", color: "#ec4899" },
];

export function buildSoulCard(
  name: string,
  totalNotes: number,
  totalInteractions: number,
  dominantDomain: string
): SoulCard {
  const archetype = ARCHETYPES.find((a) => a.trait === dominantDomain) ?? ARCHETYPES[2];
  const xp = totalNotes * 10 + totalInteractions * 5;
  const level = Math.floor(xp / 100) + 1;

  return {
    id: crypto.randomUUID(),
    title: name,
    archetype: archetype.name,
    description: `A digital being shaped by ${totalNotes} captured ideas and ${totalInteractions} crew interactions.`,
    attributes: [
      { name: "Knowledge", value: Math.min(totalNotes / 10, 10), maxValue: 10, description: "Notes captured" },
      { name: "Wisdom", value: Math.min(totalInteractions / 5, 10), maxValue: 10, description: "Agent interactions" },
      { name: "Energy", value: 7.5, maxValue: 10, description: "Operational energy" },
      { name: "Focus", value: 8, maxValue: 10, description: "Concentration level" },
      { name: "Creativity", value: 6, maxValue: 10, description: "Generative output" },
    ],
    dominantTrait: dominantDomain,
    color: archetype.color,
    level,
    xp: xp % 100,
    xpToNextLevel: 100,
  };
}

export function getSoulStateColor(value: number): string {
  if (value >= 0.8) return "#22c55e";
  if (value >= 0.5) return "#f59e0b";
  return "#ef4444";
}
