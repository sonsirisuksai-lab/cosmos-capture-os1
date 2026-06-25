// test-migration.ts — Test Migration Tool
// Run: pnpm --filter @workspace/cosmos test:migration

import { runMigration, verifyMigration, clearCosmosLocalStorage } from "../src/lib/storage/migration";

async function testMigration() {
  console.log("\n🗄️ ===== Testing Migration Tool =====\n");

  // Seed some fake localStorage data for testing
  const testData = [
    { key: "cosmos.objects.v1", value: JSON.stringify([{ id: "obj-1", type: "note", content: "Test note", createdAt: Date.now() }]) },
    { key: "cosmos.events.v1", value: JSON.stringify([{ id: "ev-1", type: "system_event", payload: {}, createdAt: Date.now() }]) },
    { key: "cosmos.soul.v1", value: JSON.stringify([{ id: "soul-1", name: "Explorer", trait: "curiosity" }]) },
  ];

  for (const { key, value } of testData) {
    // Note: localStorage is browser-only; in Node this will gracefully show what would happen
    try {
      localStorage.setItem(key, value);
    } catch {
      // Expected in Node environment — show simulation output
    }
  }

  console.log("🔄 Running migration...");
  const result = await runMigration();

  console.log(`\n📊 Migration Result:`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Migrated: ${result.migrated} items`);
  console.log(`  Errors: ${result.errors}`);
  console.log(`\n📋 Logs:`);
  for (const log of result.logs) {
    console.log(`  ${log}`);
  }

  console.log("\n🔍 Running verification...");
  const verification = await verifyMigration();
  console.log(`  ${verification}`);

  console.log("\n✨ Migration test complete!\n");
}

testMigration().catch(console.error);
