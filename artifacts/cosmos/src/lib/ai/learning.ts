// Self-Learning Loop — track feedback, analyze patterns, surface improvements
import { saveEntry, getAllEntries } from "../storage/indexeddb";

export interface UserFeedback {
  id: string;
  timestamp: number;
  input: string;
  response: string;
  rating: number; // 1-5
  liked: boolean;
  agent: string;
  provider: string;
  tags: string[];
}

export interface LearningInsights {
  topAgents: { agent: string; count: number; avgRating: number }[];
  commonTopics: { tag: string; count: number }[];
  improvementAreas: string[];
  totalFeedbacks: number;
  avgRating: number;
}

const ENTRY_TYPE = "feedback";

export async function recordFeedback(
  feedback: Omit<UserFeedback, "id" | "timestamp">
): Promise<UserFeedback> {
  const entry: UserFeedback = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...feedback,
  };
  await saveEntry({ id: entry.id, type: ENTRY_TYPE, data: entry, timestamp: entry.timestamp });
  return entry;
}

export async function getAllFeedbacks(since?: number): Promise<UserFeedback[]> {
  const all = await getAllEntries(ENTRY_TYPE);
  const feedbacks = all.map((e) => e.data as UserFeedback);
  return since ? feedbacks.filter((f) => f.timestamp >= since) : feedbacks;
}

export async function analyzeLearningPatterns(): Promise<LearningInsights> {
  const feedbacks = await getAllFeedbacks();

  if (feedbacks.length === 0) {
    return {
      topAgents: [],
      commonTopics: [],
      improvementAreas: ["Start rating AI responses to unlock learning insights"],
      totalFeedbacks: 0,
      avgRating: 0,
    };
  }

  const agentMap = new Map<string, { count: number; total: number }>();
  const tagMap = new Map<string, number>();
  const improvements: string[] = [];

  for (const f of feedbacks) {
    const ag = agentMap.get(f.agent) ?? { count: 0, total: 0 };
    ag.count++;
    ag.total += f.rating;
    agentMap.set(f.agent, ag);

    for (const tag of f.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }

    if (f.rating <= 2) {
      improvements.push(`${f.agent}: needs improvement — "${f.input.slice(0, 50)}"`);
    }
  }

  const topAgents = Array.from(agentMap.entries())
    .map(([agent, d]) => ({ agent, count: d.count, avgRating: Math.round(d.total / d.count) }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  const commonTopics = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalFeedbacks = feedbacks.length;
  const avgRating = Math.round(feedbacks.reduce((s, f) => s + f.rating, 0) / totalFeedbacks);

  return { topAgents, commonTopics, improvementAreas: improvements.slice(0, 5), totalFeedbacks, avgRating };
}

/** Generate proactive recommendations based on learning patterns */
export async function generateRecommendations(recentNoteCount: number): Promise<string[]> {
  const insights = await analyzeLearningPatterns();
  const recs: string[] = [];

  if (recentNoteCount < 5) recs.push("📝 Add more notes to grow your Knowledge Vault");
  if (insights.totalFeedbacks === 0) recs.push("⭐ Rate your next AI response to train the crew");
  if (insights.avgRating > 0 && insights.avgRating < 3) recs.push("🔧 Switch AI provider to improve response quality");
  if (insights.topAgents.length > 0) recs.push(`🏆 Your best agent: ${insights.topAgents[0].agent} (avg ${insights.topAgents[0].avgRating}★)`);

  // Always include these
  recs.push("🌌 Explore Universe OS to manage your life domains");
  recs.push("🔮 Run a Simulation to predict your future trajectory");
  recs.push("📜 Generate your Legacy Book from your captured memories");

  return recs.slice(0, 5);
}
