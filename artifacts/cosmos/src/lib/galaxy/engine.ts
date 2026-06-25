import type { Galaxy } from "./types";
import { DEFAULT_GALAXIES } from "./types";
import { saveEntry, getAllEntries } from "../storage/indexeddb";

const ENTRY_TYPE = "galaxy";

export async function initGalaxies(universeIds: Record<string, string>): Promise<Galaxy[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  if (stored.length > 0) {
    return stored.map((e) => e.data as Galaxy);
  }
  const galaxies: Galaxy[] = DEFAULT_GALAXIES.map((g, i) => ({
    ...g,
    universeId: universeIds[g.universeId] ?? g.universeId,
    id: crypto.randomUUID(),
    createdAt: Date.now() - i * 1000,
    updatedAt: Date.now(),
  }));
  for (const g of galaxies) {
    await saveEntry({ id: g.id, type: ENTRY_TYPE, data: g, timestamp: g.createdAt });
  }
  return galaxies;
}

export async function getAllGalaxies(universeId?: string): Promise<Galaxy[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  const all = stored.map((e) => e.data as Galaxy);
  return universeId ? all.filter((g) => g.universeId === universeId) : all;
}

export async function createGalaxy(
  galaxy: Omit<Galaxy, "id" | "createdAt" | "updatedAt">
): Promise<Galaxy> {
  const newGalaxy: Galaxy = {
    ...galaxy,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveEntry({ id: newGalaxy.id, type: ENTRY_TYPE, data: newGalaxy, timestamp: newGalaxy.createdAt });
  return newGalaxy;
}

export async function getGalaxyStats(
  galaxyId: string
): Promise<{ planetCount: number }> {
  const { getAllEntries: getPlanets } = await import("../storage/indexeddb");
  const planets = await getPlanets("planet");
  return { planetCount: planets.filter((e) => (e.data as any).galaxyId === galaxyId).length };
}
