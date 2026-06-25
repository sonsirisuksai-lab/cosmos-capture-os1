// test-universe.ts — Test Universe Engine
// Run: pnpm --filter @workspace/cosmos test:universe

import { initUniverses, getAllUniverses, getActiveUniverse, switchUniverse, getUniverseStats } from "../src/lib/universe/engine";

async function testUniverse() {
  console.log("\n🌌 ===== Testing Universe Engine =====\n");

  // Init universes (creates defaults if none exist in IndexedDB)
  const universes = await initUniverses();
  console.log(`📦 Initialized ${universes.length} universes:`);
  for (const u of universes) {
    console.log(`  ${u.icon} ${u.name} [${u.status}] — ${u.mood} mood`);
  }

  const active = await getActiveUniverse();
  console.log(`\n✅ Active Universe: ${active?.icon} ${active?.name}`);

  const stats = getUniverseStats(universes);
  console.log(`\n📊 Stats: total=${stats.total} active=${stats.active} dormant=${stats.dormant} hidden=${stats.hidden}`);

  if (universes.length > 1) {
    const second = universes[1];
    console.log(`\n🔄 Switching to "${second.name}"...`);
    await switchUniverse(second.id);
    const newActive = await getActiveUniverse();
    console.log(`✅ New active: ${newActive?.name}`);
  }

  console.log("\n✨ Universe test complete!\n");
}

testUniverse().catch(console.error);
