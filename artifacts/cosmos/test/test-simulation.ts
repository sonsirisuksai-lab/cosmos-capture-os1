// test-simulation.ts — Test Simulation Engine
// Run: pnpm --filter @workspace/cosmos test:simulation

import { runSimulation, getAllSimulations, getSimulationIcon } from "../src/lib/simulation/engine";
import type { SimulationType, SimulationTimeframe } from "../src/lib/simulation/types";

const SCENARIOS: Array<{ type: SimulationType; scenario: string; timeframe: SimulationTimeframe }> = [
  { type: "career", scenario: "Become a senior AI engineer", timeframe: "3y" },
  { type: "learning", scenario: "Master distributed systems", timeframe: "1y" },
  { type: "health", scenario: "Run a marathon", timeframe: "1y" },
];

async function testSimulation() {
  console.log("\n🔮 ===== Testing Simulation Engine =====\n");

  for (const s of SCENARIOS) {
    console.log(`\n${getSimulationIcon(s.type)} Running ${s.type.toUpperCase()} simulation...`);
    console.log(`   Scenario: "${s.scenario}" · Timeframe: ${s.timeframe}`);

    const sim = await runSimulation(s.type, s.scenario, s.timeframe);
    console.log(`   Confidence: ${sim.confidence}%`);
    console.log(`   Risk Score: ${sim.riskScore}%`);
    console.log(`   Best Path: ${sim.bestPath}`);
    console.log(`   Predictions:`);
    for (const p of sim.predictions) {
      console.log(`     → ${p}`);
    }
    if (sim.warningSignals.length > 0) {
      console.log(`   ⚠️ Warnings:`);
      for (const w of sim.warningSignals) {
        console.log(`     ! ${w}`);
      }
    }
  }

  const all = await getAllSimulations();
  console.log(`\n📊 Total simulations stored: ${all.length}`);

  console.log("\n✨ Simulation test complete!\n");
}

testSimulation().catch(console.error);
