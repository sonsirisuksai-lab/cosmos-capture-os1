// test/test-intelligence.ts — Phase 4 Intelligence Upgrade Tests
// Run: pnpm --filter @workspace/cosmos test:intelligence

import { callIntelligence } from "../src/lib/ai/intelligence";
import type { AgentContext } from "../src/lib/ai/context";

function mockCtx(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    userIdentity: { name: "Commander", beliefs: ["Growth mindset"], goals: ["Master AI", "Ship products"], values: [] },
    recentMemories: [{ id: "m1", type: "note", content: "Learned about embeddings today" }],
    relevantKnowledge: [{ id: "k1", title: "Machine Learning Basics", content: "Supervised learning overview", confidence: 80 }],
    timeline: { recentActivities: ["Studied ML", "Built COSMOS", "Read papers"], currentFocus: "AI Development", streak: 7 },
    emotionalState: { mood: "focused", sentiment: "positive", energy: 75 },
    recentNotes: [{ title: "ML Notes", content: "Learning embeddings" }],
    ...overrides,
  };
}

async function runTests() {
  console.log("\n🧠 ===== Intelligence Upgrade Tests (Phase 4) =====\n");
  let passed = 0;
  let failed = 0;

  function assert(label: string, condition: boolean) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // ── Test 1: Mock Mode — returns a response ──────────────────────────────────
  console.log("📌 Test 1: Mock Mode (no API key)");
  const ctx = mockCtx();
  const res1 = await callIntelligence("Help me plan my AI learning journey", ctx, "mock", "");
  assert("Returns content string", typeof res1.content === "string" && res1.content.length > 20);
  assert("Provider is mock", res1.provider === "mock");
  assert("Has agentName", typeof res1.agentName === "string" && res1.agentName.length > 0);
  assert("Has agentEmoji", typeof res1.agentEmoji === "string");
  assert("Has confidence", typeof res1.confidence === "number");

  // ── Test 2: Agent routing — dream/goal keywords → Luffy ────────────────────
  console.log("\n📌 Test 2: Agent routing by keyword");
  const res2 = await callIntelligence("What is my dream and purpose in life?", ctx, "mock", "");
  assert("Goal/dream → Luffy selected", res2.agentName.toLowerCase() === "luffy");

  const res2b = await callIntelligence("Check my health and sleep habits", ctx, "mock", "");
  assert("Health keyword → Chopper selected", res2b.agentName.toLowerCase() === "chopper");

  const res2c = await callIntelligence("Debug this code and write unit tests", ctx, "mock", "");
  assert("Code keyword → Zoro selected", res2c.agentName.toLowerCase() === "zoro");

  // ── Test 3: Context-aware response includes user data ─────────────────────
  console.log("\n📌 Test 3: Context awareness");
  const ctxWithGoals = mockCtx({
    userIdentity: { name: "Luffy D. Cosmo", beliefs: [], goals: ["Become King of Pirates"], values: [] },
    emotionalState: { mood: "excited", sentiment: "positive", energy: 95 },
    timeline: { recentActivities: ["Trained with swords", "Read maps"], currentFocus: "Navigation", streak: 21 },
  });
  const res3 = await callIntelligence("What should I focus on today?", ctxWithGoals, "mock", "");
  assert("Response is non-empty", res3.content.length > 10);
  assert("Has valid provider", ["mock", "openrouter", "gemini"].includes(res3.provider));

  // ── Test 4: OpenRouter fallback to mock when no key ───────────────────────
  console.log("\n📌 Test 4: OpenRouter fallback (no key → mock)");
  const res4 = await callIntelligence("Plan my week", ctx, "openrouter", "");
  assert("Falls back to mock when no key", res4.provider === "mock");
  assert("Still returns valid content", res4.content.length > 10);

  // ── Test 5: Gemini fallback to mock when no key ───────────────────────────
  console.log("\n📌 Test 5: Gemini fallback (no key → mock)");
  const res5 = await callIntelligence("Research quantum computing", ctx, "gemini", "");
  assert("Falls back to mock when no key", res5.provider === "mock");

  // ── Test 6: Multiple prompts — variety of agent responses ─────────────────
  console.log("\n📌 Test 6: Variety of prompts");
  const prompts = [
    "Help me budget my expenses",
    "I feel sad and unmotivated",
    "Tell me a story from my past",
    "Build a system for my morning routine",
  ];
  for (const p of prompts) {
    const r = await callIntelligence(p, ctx, "mock", "");
    assert(`"${p.slice(0, 30)}…" → got response`, r.content.length > 10);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log("🚀 All intelligence tests passed! Phase 4 AI is operational.\n");
  } else {
    console.error(`⚠️ ${failed} test(s) failed — review output above.\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal error running intelligence tests:", err);
  process.exit(1);
});
