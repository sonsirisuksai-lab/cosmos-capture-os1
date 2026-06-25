// Context Builder — assembles rich user context before sending to an Agent
// Adapted to function-based engines and PostgreSQL API

import { getAllEntries } from "../storage/indexeddb";
import { consolidateMemories, type MemoryEntry } from "../memory/engine";

export interface AgentContext {
  userIdentity: {
    name: string;
    beliefs: string[];
    goals: string[];
    values: string[];
  };
  recentMemories: { id: string; type: string; content: string }[];
  relevantKnowledge: { id: string; title: string; content: string; confidence: number }[];
  timeline: { recentActivities: string[]; currentFocus: string; streak: number };
  emotionalState: { mood: string; sentiment: "positive" | "negative" | "neutral"; energy: number };
  recentNotes: { title: string; content: string; agentName?: string | null }[];
}

function getDefaultContext(): AgentContext {
  return {
    userIdentity: { name: "Commander", beliefs: [], goals: [], values: [] },
    recentMemories: [],
    relevantKnowledge: [],
    timeline: { recentActivities: [], currentFocus: "General", streak: 0 },
    emotionalState: { mood: "neutral", sentiment: "neutral", energy: 60 },
    recentNotes: [],
  };
}

/** Fetch recent notes from the PostgreSQL API */
async function fetchRecentNotes(baseUrl: string, limit = 5) {
  try {
    const res = await fetch(`${baseUrl}/api/notes?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.notes ?? data ?? []).slice(0, limit);
  } catch {
    return [];
  }
}

/** Fetch orchestrate history from API */
async function fetchOrchestrateHistory(baseUrl: string, limit = 10) {
  try {
    const res = await fetch(`${baseUrl}/api/orchestrate/history?limit=${limit}`);
    if (!res.ok) return [];
    return (await res.json()).slice(0, limit);
  } catch {
    return [];
  }
}

/** Build full AgentContext from available data sources */
export async function buildContext(
  userId = "user",
  apiBaseUrl = ""
): Promise<AgentContext> {
  const ctx = getDefaultContext();
  ctx.userIdentity.name = userId === "user" ? "Commander" : userId;

  try {
    // 1. Pull notes from PostgreSQL API
    const notes = await fetchRecentNotes(apiBaseUrl, 5);
    ctx.recentNotes = notes.map((n: any) => ({
      title: n.title,
      content: (n.content ?? "").slice(0, 300),
      agentName: n.agentName,
    }));

    // Build relevantKnowledge from notes
    ctx.relevantKnowledge = notes.slice(0, 5).map((n: any) => ({
      id: String(n.id),
      title: n.title,
      content: (n.content ?? "").slice(0, 200),
      confidence: n.confidence ?? 70,
    }));

    // 2. Pull recent orchestrate history for timeline activities
    const history = await fetchOrchestrateHistory(apiBaseUrl, 10);
    ctx.timeline.recentActivities = history.map((h: any) => h.prompt ?? "").slice(0, 8);
    if (history.length) {
      ctx.timeline.currentFocus = history[0]?.domain ?? "General";
      ctx.timeline.streak = Math.min(history.length, 30);
    }

    // 3. Pull local IndexedDB memories
    const memEntries = await getAllEntries("memory");
    const memories = memEntries.map((e) => e.data as MemoryEntry);
    const consolidated = consolidateMemories(memories).slice(0, 5);
    ctx.recentMemories = consolidated.map((m) => ({
      id: m.id,
      type: m.type,
      content: m.content.slice(0, 200),
    }));

    // 4. Soul from IndexedDB
    const soulEntries = await getAllEntries("soul");
    if (soulEntries.length > 0) {
      const soul = soulEntries[0].data as any;
      ctx.userIdentity.beliefs = Array.isArray(soul.beliefs) ? soul.beliefs : [];
      ctx.userIdentity.goals = Array.isArray(soul.goals) ? soul.goals : [];
    }

    // 5. Compute emotional state from note confidence / recent activity
    const avgConfidence =
      notes.length > 0
        ? notes.reduce((s: number, n: any) => s + (n.confidence ?? 70), 0) / notes.length
        : 60;
    ctx.emotionalState = {
      mood: avgConfidence >= 70 ? "focused" : avgConfidence >= 50 ? "neutral" : "reflective",
      sentiment: avgConfidence >= 65 ? "positive" : avgConfidence <= 40 ? "negative" : "neutral",
      energy: Math.round(avgConfidence),
    };
  } catch (err) {
    console.warn("[ContextBuilder] Failed to enrich context:", err);
  }

  return ctx;
}

/** Format context into a concise string for injection into prompts */
export function formatContextForPrompt(ctx: AgentContext): string {
  const parts: string[] = [];
  parts.push(`User: ${ctx.userIdentity.name}`);
  if (ctx.userIdentity.goals.length) parts.push(`Goals: ${ctx.userIdentity.goals.join(", ")}`);
  if (ctx.userIdentity.beliefs.length) parts.push(`Beliefs: ${ctx.userIdentity.beliefs.join(", ")}`);
  if (ctx.recentNotes.length) parts.push(`Recent notes: ${ctx.recentNotes.map((n) => n.title).join(", ")}`);
  if (ctx.timeline.recentActivities.length)
    parts.push(`Recent prompts: ${ctx.timeline.recentActivities.slice(0, 3).join(", ")}`);
  parts.push(`Mood: ${ctx.emotionalState.mood} (${ctx.emotionalState.sentiment})`);
  parts.push(`Current focus: ${ctx.timeline.currentFocus}`);
  return parts.join("\n");
}
