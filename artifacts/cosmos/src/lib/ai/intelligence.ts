// Intelligence Engine — Real AI integration: OpenRouter, Gemini, or Mock
// Supports graceful fallback: if the API key is empty or invalid, falls back to mock

import type { AgentContext } from "./context";
import { formatContextForPrompt } from "./context";
import { AGENTS } from "./agents";

export type AIProvider = "openrouter" | "gemini" | "mock";

export interface AIResponse {
  content: string;
  provider: AIProvider;
  agentName: string;
  agentEmoji: string;
  confidence: number;
  reasoning?: string;
  tokensUsed?: number;
}

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  luffy:
    "You are Luffy — the Vision AI of COSMOS. You inspire, think big, and cut through overthinking. Respond in 2-3 sentences: bold, direct, captain-level.",
  zoro:
    "You are Zoro — the Execution AI. You write clean plans, solve problems step by step. Be concise and tactical. No fluff.",
  robin:
    "You are Robin — the Knowledge AI. You research deeply, connect dots, surface hidden insights. Reference context where relevant.",
  nami:
    "You are Nami — the Resource AI. You track resources, create plans with numbers, manage budgets. Be precise.",
  franky:
    "You are Franky — the Builder AI. You design systems and tools. Think in components and architecture.",
  chopper:
    "You are Chopper — the Health AI. You monitor wellbeing and give actionable, caring, evidence-based advice.",
  brook:
    "You are Brook — the Memory AI. You preserve stories, connect emotionally to the past, and surface nostalgia.",
  jinbe:
    "You are Jinbe — the Operations AI. You maintain stability, enforce discipline, and optimize daily workflows.",
  sanji:
    "You are Sanji — the Quality AI. You review work, audit details, and polish output. Perfectionist but constructive.",
  usopp:
    "You are Usopp — the Social AI. You analyze relationships and recommend communication strategies. Witty, non-judgmental.",
};

function selectAgent(input: string): typeof AGENTS[0] {
  const lower = input.toLowerCase();
  const scored = AGENTS.map((a) => ({
    agent: a,
    score: a.keywords.reduce((s, kw) => (lower.includes(kw) ? s + 1 : s), 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].agent : AGENTS[7]; // default Jinbe
}

function buildSystemPrompt(agentName: string, ctx: AgentContext): string {
  const base = AGENT_SYSTEM_PROMPTS[agentName.toLowerCase()] ?? AGENT_SYSTEM_PROMPTS.jinbe;
  const ctxStr = formatContextForPrompt(ctx);
  return `${base}\n\nCurrent user context:\n${ctxStr}\n\nKeep responses focused, warm, and actionable. 2-4 sentences max.`;
}

function mockResponse(prompt: string, ctx: AgentContext, agent: typeof AGENTS[0]): AIResponse {
  const name = agent.name.toLowerCase();
  const mood = ctx.emotionalState.mood;
  const focus = ctx.timeline.currentFocus;
  const noteCount = ctx.recentNotes.length;

  const templates: Record<string, string> = {
    luffy: `That spark you have? That's the real treasure. "${prompt.slice(0, 40)}..." is your call to adventure — don't wait for the perfect moment. Set sail now, captain.`,
    zoro: `"${prompt.slice(0, 40)}..." — here's the plan: break it into 3 steps, execute the first one today. No delays. Strength comes from action, not preparation.`,
    robin: `Based on your ${noteCount} captured notes and current focus on "${focus}", here's what I found: the key insight is to connect existing knowledge rather than starting fresh.`,
    nami: `Let me calculate: "${prompt.slice(0, 30)}..." requires resource allocation. Start with minimum viable effort, measure ROI, then scale. Numbers don't lie.`,
    franky: `SUPER idea! Here's the architecture: start with a core module, add integrations layer by layer. Build it modular so it scales. I'll draw the blueprint.`,
    chopper: `Your mood is "${mood}" right now. That matters. "${prompt.slice(0, 30)}..." — before anything else, make sure your energy levels support it. Rest is productive.`,
    brook: `I remember a story from your timeline... "${prompt.slice(0, 30)}..." echoes a pattern I've seen before. The past holds the answer — let's look at it together.`,
    jinbe: `Steady the ship. "${prompt.slice(0, 30)}..." becomes manageable with a system. Let me help you build a repeatable routine around it. Consistency is the superpower.`,
    sanji: `Let me review this carefully. "${prompt.slice(0, 30)}..." — I found ${Math.floor(Math.random() * 3) + 1} areas for improvement. Quality matters above all else.`,
    usopp: `Based on your network and communication style, "${prompt.slice(0, 30)}..." is best approached through storytelling. Let me craft the right message for your audience.`,
  };

  return {
    content: templates[name] ?? `COSMOS analyzing: "${prompt.slice(0, 50)}..." — pattern recognized. Processing with full crew intelligence.`,
    provider: "mock",
    agentName: agent.name,
    agentEmoji: agent.emoji,
    confidence: 65,
    reasoning: "Local mock response (no API key configured)",
  };
}

export async function callIntelligence(
  prompt: string,
  ctx: AgentContext,
  provider: AIProvider = "mock",
  apiKey = ""
): Promise<AIResponse> {
  const agent = selectAgent(prompt);

  if (!apiKey || provider === "mock") {
    return mockResponse(prompt, ctx, agent);
  }

  const systemPrompt = buildSystemPrompt(agent.name.toLowerCase(), ctx);

  if (provider === "openrouter") {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "COSMOS-CAPTURE-OS",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.75,
        }),
      });
      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
      const data = await res.json();
      return {
        content: data.choices?.[0]?.message?.content ?? "No response",
        provider: "openrouter",
        agentName: agent.name,
        agentEmoji: agent.emoji,
        confidence: 88,
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (err) {
      console.error("[Intelligence] OpenRouter failed, falling back to mock:", err);
      return mockResponse(prompt, ctx, agent);
    }
  }

  if (provider === "gemini") {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.75 },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response",
        provider: "gemini",
        agentName: agent.name,
        agentEmoji: agent.emoji,
        confidence: 88,
      };
    } catch (err) {
      console.error("[Intelligence] Gemini failed, falling back to mock:", err);
      return mockResponse(prompt, ctx, agent);
    }
  }

  return mockResponse(prompt, ctx, agent);
}
