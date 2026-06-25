export interface Agent {
  name: string;
  emoji: string;
  role: string;
  domain: string;
  keywords: string[];
  personality: string;
}

export const AGENTS: Agent[] = [
  { name: "Luffy", emoji: "🏴‍☠️", role: "Vision", domain: "vision", keywords: ["goal", "dream", "purpose", "why", "mission", "ambition", "future", "vision", "passion"], personality: "Bold, inspiring, direct. Talks about freedom and dreams." },
  { name: "Zoro", emoji: "⚔️", role: "Execution", domain: "execution", keywords: ["code", "build", "debug", "logic", "implement", "technical", "error", "bug", "function", "deploy", "program"], personality: "Focused, no-nonsense. Gets things done without complaining." },
  { name: "Nami", emoji: "🗺️", role: "Finance", domain: "finance", keywords: ["budget", "plan", "resource", "cost", "money", "finance", "invest", "revenue", "expense", "roi", "profit"], personality: "Strategic, resourceful. Knows the value of everything." },
  { name: "Robin", emoji: "📚", role: "Knowledge", domain: "knowledge", keywords: ["research", "learn", "history", "insight", "study", "analyze", "understand", "knowledge", "fact", "information", "data"], personality: "Calm, analytical. Uncovers hidden meaning in everything." },
  { name: "Franky", emoji: "🔧", role: "Builder", domain: "builder", keywords: ["build", "system", "automate", "pipeline", "infrastructure", "architect", "design", "construct", "setup", "configure"], personality: "Enthusiastic builder. Loves creating things that work super." },
  { name: "Chopper", emoji: "🩺", role: "Health", domain: "health", keywords: ["wellness", "sleep", "exercise", "mental", "health", "stress", "energy", "fitness", "diet", "rest", "wellbeing"], personality: "Caring, attentive. Puts your wellbeing above everything." },
  { name: "Brook", emoji: "🎵", role: "Memory", domain: "memory", keywords: ["nostalgia", "story", "emotion", "past", "remember", "memory", "feel", "experience", "recall", "journal", "reflect"], personality: "Poetic, soulful. Connects present moments to meaningful past." },
  { name: "Jinbe", emoji: "⚓", role: "Operations", domain: "operations", keywords: ["routine", "discipline", "process", "daily", "habit", "schedule", "consistent", "productive", "workflow", "organize"], personality: "Steady, wise. Keeps everything running with calm discipline." },
  { name: "Sanji", emoji: "🍳", role: "Quality", domain: "quality", keywords: ["review", "security", "audit", "test", "quality", "check", "validate", "improve", "refine", "polish", "perfect"], personality: "Perfectionist with flair. Settles for nothing less than excellent." },
  { name: "Usopp", emoji: "🎯", role: "Social", domain: "social", keywords: ["people", "communication", "strategy", "influence", "network", "community", "collaborate", "team", "leadership", "persuade"], personality: "Creative storyteller. Turns strategy into compelling narratives." },
];

export function routeAgent(input: string): Agent {
  const lower = input.toLowerCase();
  const scores = AGENTS.map((agent) => {
    const score = agent.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    return { agent, score };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].agent : AGENTS[3]; // default: Robin (knowledge)
}

export interface OrchestrateResult {
  agentName: string;
  agentEmoji: string;
  response: string;
  domain: string;
  suggestions: string[];
  noteId?: number | null;
}

export function generateMockResponse(agent: Agent, prompt: string): string {
  const templates: Record<string, string[]> = {
    vision: [
      `The real question isn't how — it's WHY. Your prompt about "${prompt.slice(0, 40)}..." reveals a deeper hunger. Chart your destination first, the path reveals itself.`,
      `Every great journey started exactly like this. "${prompt.slice(0, 30)}..." — that spark? That's your true north. Don't overthink it, just move.`,
    ],
    execution: [
      `Let's cut through the noise. For "${prompt.slice(0, 40)}..." — break it into: 1) Define the goal, 2) Identify blockers, 3) Execute without hesitation.`,
      `Direct answer: tackle "${prompt.slice(0, 35)}..." by isolating the core problem first. Everything else is noise until that's solved.`,
    ],
    finance: [
      `Before you go further on "${prompt.slice(0, 40)}...", map the resources. What's the cost? What's the return? Numbers don't lie.`,
      `Every decision has a price. "${prompt.slice(0, 35)}..." — let's quantify it. Time, money, opportunity cost. Then we decide.`,
    ],
    knowledge: [
      `Fascinating. "${prompt.slice(0, 40)}..." connects to patterns I've studied. The key insight: knowledge builds on itself — what do you already know about this?`,
      `This is worth examining deeply. "${prompt.slice(0, 35)}..." has layers. Let me surface the hidden connections in what you're asking.`,
    ],
    builder: [
      `SUPER! "${prompt.slice(0, 40)}..." — I can already see the architecture. We need three things: a solid foundation, modular components, and clear interfaces. Let's build!`,
      `Building is believing. "${prompt.slice(0, 35)}..." — sketch the system, identify dependencies, iterate. The first version just needs to exist.`,
    ],
    health: [
      `Your wellbeing comes first. Regarding "${prompt.slice(0, 40)}..." — how's your energy? Your mental state directly affects how you handle this.`,
      `Take care of yourself through this. "${prompt.slice(0, 35)}..." requires sustained effort — make sure you're rested, nourished, and focused.`,
    ],
    memory: [
      `Ah, "${prompt.slice(0, 40)}..." brings something to mind. The past holds patterns we often forget. What memory does this connect to for you?`,
      `Every thought is a thread in the tapestry. "${prompt.slice(0, 35)}..." — where did this feeling or idea first come from? Trace it back.`,
    ],
    operations: [
      `Consistency beats intensity. "${prompt.slice(0, 40)}..." becomes manageable when it's part of your daily rhythm. What routine supports this?`,
      `Process is power. "${prompt.slice(0, 35)}..." — let's systematize it. Define the trigger, the action, and the reward. Then repeat.`,
    ],
    quality: [
      `Good isn't good enough. "${prompt.slice(0, 40)}..." — what would make this exceptional? Define the standard first, then work backward.`,
      `Quality is non-negotiable. "${prompt.slice(0, 35)}..." requires a review lens. What could go wrong? What would make this perfect?`,
    ],
    social: [
      `Every idea needs an audience. "${prompt.slice(0, 40)}..." — who needs to hear this? What's the story that makes them care?`,
      `Communication is strategy. "${prompt.slice(0, 35)}..." — frame it for your audience. The right message to the right person changes everything.`,
    ],
  };

  const agentTemplates = templates[agent.domain] || templates.knowledge;
  return agentTemplates[Math.floor(Math.random() * agentTemplates.length)];
}

export function generateSuggestions(agent: Agent, prompt: string): string[] {
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
  return (base[agent.domain] || base.knowledge).slice(0, 3);
}
