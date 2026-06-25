import type { Simulation, SimulationType, SimulationTimeframe } from "./types";
import { saveEntry, getAllEntries } from "../storage/indexeddb";

const ENTRY_TYPE = "simulation";

export async function getAllSimulations(type?: SimulationType): Promise<Simulation[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  const all = stored.map((e) => e.data as Simulation);
  return type ? all.filter((s) => s.type === type) : all;
}

export async function runSimulation(
  type: SimulationType,
  scenario: string,
  timeframe: SimulationTimeframe
): Promise<Simulation> {
  const reviewEntries = await getAllEntries("review");
  const reviews = reviewEntries.map((e) => e.data as any);
  const avgProductivity =
    reviews.filter((r) => r.productivityScore).reduce((a: number, r: any) => a + (r.productivityScore ?? 0), 0) /
    (reviews.length || 1);

  const predictions: string[] = [];
  const warningSignals: string[] = [];

  if (type === "career") {
    predictions.push(
      `Based on your learning velocity, you will master ${Math.floor(Math.random() * 3) + 1} new skills in 12 months.`
    );
    predictions.push(`Your professional network will grow by ${Math.floor(Math.random() * 50) + 10} connections.`);
    predictions.push(`You are on track to reach a leadership role within ${timeframe}.`);
    if (avgProductivity < 50) warningSignals.push("Productivity below 50% — risk of burnout detected.");
  } else if (type === "finance") {
    predictions.push(`Your savings will grow by ${Math.floor(Math.random() * 20) + 5}% annually.`);
    predictions.push(`You will be able to invest ${Math.floor(Math.random() * 100) + 50} units by end of ${timeframe}.`);
    predictions.push("Diversification opportunities identified in Q3.");
  } else if (type === "health") {
    predictions.push(
      `Your energy level will increase by ${Math.floor(Math.random() * 20) + 10}% if you maintain current routine.`
    );
    predictions.push(`Sleep quality will improve by ${Math.floor(Math.random() * 15) + 5}% with habit consistency.`);
    predictions.push("Longevity score projected to improve over the next 12 months.");
    if (avgProductivity > 80) warningSignals.push("High output — schedule recovery time to avoid depletion.");
  } else if (type === "learning") {
    predictions.push(`You will complete ${Math.floor(Math.random() * 5) + 2} major learning tracks in ${timeframe}.`);
    predictions.push(`Concept density in Knowledge Galaxy will increase by ${Math.floor(Math.random() * 30) + 20}%.`);
    predictions.push("Deep expertise in primary domains is achievable.");
  } else if (type === "project") {
    predictions.push(`${Math.floor(Math.random() * 3) + 1} major projects will reach completion within ${timeframe}.`);
    predictions.push("Planet health scores are trending upward — momentum is building.");
    predictions.push("Cross-galaxy synergies detected — collaboration will accelerate growth.");
  }

  const confidence = Math.round(60 + Math.random() * 30);
  const riskScore = Math.round(Math.random() * 40);

  const simulation: Simulation = {
    id: crypto.randomUUID(),
    type,
    scenario,
    timeframe,
    predictions: predictions.slice(0, 3),
    confidence,
    riskScore,
    bestPath: predictions[0] ?? "Maintain current trajectory.",
    warningSignals: warningSignals.slice(0, 2),
    createdAt: Date.now(),
  };

  await saveEntry({ id: simulation.id, type: ENTRY_TYPE, data: simulation, timestamp: simulation.createdAt });
  return simulation;
}

export function getSimulationIcon(type: SimulationType): string {
  const icons: Record<SimulationType, string> = {
    career: "💼",
    finance: "💰",
    health: "❤️",
    learning: "📚",
    project: "🚀",
  };
  return icons[type];
}
