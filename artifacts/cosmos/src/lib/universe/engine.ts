import type { Universe, UniverseMode } from "./types";
import { DEFAULT_UNIVERSES } from "./types";
import { saveEntry, getAllEntries } from "../storage/indexeddb";

const ENTRY_TYPE = "universe";

export async function initUniverses(): Promise<Universe[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  if (stored.length > 0) {
    return stored.map((e) => e.data as Universe);
  }
  const universes: Universe[] = DEFAULT_UNIVERSES.map((u, i) => ({
    ...u,
    id: crypto.randomUUID(),
    createdAt: Date.now() - i * 1000,
    updatedAt: Date.now(),
  }));
  for (const u of universes) {
    await saveEntry({ id: u.id, type: ENTRY_TYPE, data: u, timestamp: u.createdAt });
  }
  return universes;
}

export async function getAllUniverses(): Promise<Universe[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  return stored.map((e) => e.data as Universe).sort((a, b) => a.order - b.order);
}

export async function getActiveUniverse(): Promise<Universe | null> {
  const all = await getAllUniverses();
  return all.find((u) => u.status === "active") ?? all[0] ?? null;
}

export async function switchUniverse(targetId: string): Promise<Universe | null> {
  const all = await getAllUniverses();
  for (const u of all) {
    const updated: Universe = {
      ...u,
      status: u.id === targetId ? "active" : "dormant",
      updatedAt: Date.now(),
    };
    await saveEntry({ id: u.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  }
  return all.find((u) => u.id === targetId) ?? null;
}

export async function createUniverse(
  universe: Omit<Universe, "id" | "createdAt" | "updatedAt">
): Promise<Universe> {
  const newUniverse: Universe = {
    ...universe,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveEntry({ id: newUniverse.id, type: ENTRY_TYPE, data: newUniverse, timestamp: newUniverse.createdAt });
  return newUniverse;
}

export function getUniverseStats(universes: Universe[]): {
  total: number;
  active: number;
  dormant: number;
  hidden: number;
} {
  return {
    total: universes.length,
    active: universes.filter((u) => u.status === "active").length,
    dormant: universes.filter((u) => u.status === "dormant").length,
    hidden: universes.filter((u) => u.status === "hidden").length,
  };
}
