import type { Planet, Milestone, PlanetStatus } from "./types";
import { saveEntry, getAllEntries } from "../storage/indexeddb";

const ENTRY_TYPE = "planet";

async function getPlanetById(id: string): Promise<Planet | null> {
  const all = await getAllEntries(ENTRY_TYPE);
  return (all.find((e) => (e.data as Planet).id === id)?.data as Planet) ?? null;
}

export async function getAllPlanets(galaxyId?: string): Promise<Planet[]> {
  const stored = await getAllEntries(ENTRY_TYPE);
  const all = stored.map((e) => e.data as Planet);
  return galaxyId ? all.filter((p) => p.galaxyId === galaxyId) : all;
}

export async function createPlanet(
  planet: Omit<Planet, "id" | "createdAt" | "updatedAt" | "xp" | "level">
): Promise<Planet> {
  const newPlanet: Planet = {
    ...planet,
    id: crypto.randomUUID(),
    xp: 0,
    level: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveEntry({ id: newPlanet.id, type: ENTRY_TYPE, data: newPlanet, timestamp: newPlanet.createdAt });
  return newPlanet;
}

export async function addXP(planetId: string, amount: number): Promise<Planet | null> {
  const planet = await getPlanetById(planetId);
  if (!planet) return null;
  const newXP = planet.xp + amount;
  const newLevel = Math.floor(newXP / 100) + 1;
  const updated: Planet = { ...planet, xp: newXP, level: newLevel, updatedAt: Date.now() };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  return updated;
}

export async function updatePlanetHealth(planetId: string, health: number): Promise<Planet | null> {
  const planet = await getPlanetById(planetId);
  if (!planet) return null;
  const updated: Planet = {
    ...planet,
    health: Math.max(0, Math.min(100, health)),
    updatedAt: Date.now(),
  };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  return updated;
}

export async function updatePlanetStatus(planetId: string, status: PlanetStatus): Promise<Planet | null> {
  const planet = await getPlanetById(planetId);
  if (!planet) return null;
  const updated: Planet = { ...planet, status, updatedAt: Date.now() };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  return updated;
}

export async function addMilestone(planetId: string, name: string): Promise<Planet | null> {
  const planet = await getPlanetById(planetId);
  if (!planet) return null;
  const milestone: Milestone = { id: crypto.randomUUID(), name, achieved: false };
  const updated: Planet = {
    ...planet,
    milestones: [...planet.milestones, milestone],
    updatedAt: Date.now(),
  };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  return updated;
}

export async function completeMilestone(planetId: string, milestoneId: string): Promise<Planet | null> {
  const planet = await getPlanetById(planetId);
  if (!planet) return null;
  const updatedMilestones = planet.milestones.map((m) =>
    m.id === milestoneId ? { ...m, achieved: true, achievedAt: Date.now() } : m
  );
  const updated: Planet = { ...planet, milestones: updatedMilestones, updatedAt: Date.now() };
  await saveEntry({ id: updated.id, type: ENTRY_TYPE, data: updated, timestamp: updated.updatedAt });
  await addXP(planetId, 50);
  return updated;
}

export function getLevelProgress(xp: number): { level: number; progress: number; nextAt: number } {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const nextAt = 100;
  return { level, progress, nextAt };
}
