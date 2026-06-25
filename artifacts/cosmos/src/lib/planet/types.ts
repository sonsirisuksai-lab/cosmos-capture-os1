export type PlanetStatus = "seed" | "growing" | "active" | "paused" | "completed" | "archived";

export interface Milestone {
  id: string;
  name: string;
  achieved: boolean;
  achievedAt?: number;
}

export interface Planet {
  id: string;
  name: string;
  description: string;
  icon: string;
  galaxyId: string;
  status: PlanetStatus;
  xp: number;
  level: number;
  health: number;
  stability: number;
  priority: number;
  growthRate: number;
  risk: number;
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}
