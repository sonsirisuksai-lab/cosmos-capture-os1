import { AGENTS, type AgentDefinition } from "./agents";

export interface OrchestratorRequest {
  prompt: string;
  mode?: "auto" | "maka";
  saveToNotes?: boolean;
}

export interface OrchestratorResponse {
  agent: AgentDefinition;
  response: string;
  suggestions: string[];
  domain: string;
}

export function routeAgent(input: string): AgentDefinition {
  const lower = input.toLowerCase();
  const scores = AGENTS.map((agent) => {
    const score = agent.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    return { agent, score };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].agent : AGENTS[3];
}

export function generateSuggestions(agent: AgentDefinition): string[] {
  const base: Record<string, string[]> = {
    vision: ["What is your 5-year vision?", "Define your core purpose", "What would you do if you couldn't fail?"],
    execution: ["Break this into 3 actionable steps", "Identify the biggest blocker", "Set a 48-hour deadline"],
    finance: ["Calculate the ROI", "List all hidden costs", "Find the minimum viable budget"],
    knowledge: ["Research the history of this topic", "Find connecting concepts", "Create a knowledge map"],
    builder: ["Draft the system architecture", "List the dependencies", "Build the MVP first"],
    health: ["Track your energy levels today", "Schedule recovery time", "Rate your stress level 1-10"],
    memory: ["Journal about this feeling", "Connect to a past experience", "What pattern keeps repeating?"],
    operations: ["Create a daily ritual for this", "Set recurring checkpoints", "Automate what you can"],
    quality: ["Define the success criteria", "Do a pre-mortem analysis", "Get external feedback"],
    social: ["Identify your key stakeholders", "Craft the one-line pitch", "Map your network for this"],
  };
  return (base[agent.domain] ?? base.knowledge).slice(0, 3);
}
