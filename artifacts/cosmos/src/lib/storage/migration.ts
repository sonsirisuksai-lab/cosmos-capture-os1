// Migration Tool: localStorage → IndexedDB
// Adapts data from old cosmos.* localStorage keys into the COSMOS IndexedDB entries store

import { saveEntry, getAllEntries, type LocalEntry } from "./indexeddb";

export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: number;
  logs: string[];
}

/** Run full migration from localStorage cosmos.* keys → IndexedDB */
export async function runMigration(): Promise<MigrationResult> {
  const logs: string[] = [];
  let migrated = 0;
  let errors = 0;

  try {
    const keys = Object.keys(localStorage);
    const cosmosKeys = keys.filter((k) => k.startsWith("cosmos."));

    logs.push(`📦 Found ${cosmosKeys.length} cosmos keys in localStorage`);

    if (cosmosKeys.length === 0) {
      logs.push("ℹ️ Nothing to migrate — localStorage has no cosmos.* keys.");
      return { success: true, migrated: 0, errors: 0, logs };
    }

    for (const key of cosmosKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const data = JSON.parse(raw);
        const entryType = mapKeyToType(key);

        if (Array.isArray(data)) {
          for (const item of data) {
            const entry: LocalEntry = {
              id: item.id ?? crypto.randomUUID(),
              type: entryType,
              data: item,
              timestamp: item.createdAt ?? item.timestamp ?? Date.now(),
            };
            await saveEntry(entry);
            migrated++;
          }
        } else {
          const entry: LocalEntry = {
            id: data.id ?? key,
            type: entryType,
            data,
            timestamp: data.createdAt ?? Date.now(),
          };
          await saveEntry(entry);
          migrated++;
        }

        logs.push(
          `✅ Migrated "${key}" → type:"${entryType}" (${Array.isArray(data) ? data.length : 1} item${Array.isArray(data) && data.length !== 1 ? "s" : ""})`
        );
      } catch (err) {
        errors++;
        logs.push(`❌ Failed to migrate "${key}": ${String(err)}`);
      }
    }

    const verification = await verifyMigration();
    logs.push(verification);

    if (errors === 0) {
      logs.push("⚠️ localStorage data preserved. Call clearCosmosLocalStorage() when ready to clean up.");
    }

    return { success: errors === 0, migrated, errors, logs };
  } catch (err) {
    logs.push(`💥 Migration crashed: ${String(err)}`);
    return { success: false, migrated, errors: errors + 1, logs };
  }
}

/** Verify how many entries exist across known types */
export async function verifyMigration(): Promise<string> {
  try {
    const types = ["universe", "galaxy", "planet", "legacy", "simulation", "memory", "soul", "review", "collection", "timeline"];
    let total = 0;
    const counts: string[] = [];
    for (const t of types) {
      const items = await getAllEntries(t);
      if (items.length > 0) {
        counts.push(`${t}:${items.length}`);
        total += items.length;
      }
    }
    return `🔍 Verified ${total} total entries [${counts.join(", ")}]`;
  } catch (err) {
    return `❌ Verification failed: ${String(err)}`;
  }
}

/** Remove all cosmos.* keys from localStorage after a successful migration */
export async function clearCosmosLocalStorage(): Promise<number> {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("cosmos."));
  for (const key of keys) {
    localStorage.removeItem(key);
  }
  return keys.length;
}

function mapKeyToType(key: string): string {
  const map: Record<string, string> = {
    "cosmos.objects.v1": "object",
    "cosmos.relationships.v1": "edge",
    "cosmos.collections.v1": "collection",
    "cosmos.events.v1": "event",
    "cosmos.soul.v1": "soul",
    "cosmos.settings.v1": "settings",
    "cosmos.universe.v1": "universe",
    "cosmos.galaxy.v1": "galaxy",
    "cosmos.planet.v1": "planet",
    "cosmos.legacy.v1": "legacy",
    "cosmos.simulation.v1": "simulation",
    "cosmos.memory.v1": "memory",
    "cosmos.timeline.v1": "timeline",
    "cosmos.review.v1": "review",
  };
  return map[key] ?? "object";
}
