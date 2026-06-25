export type SimulationType = "career" | "finance" | "health" | "learning" | "project";
export type SimulationTimeframe = "1y" | "3y" | "5y" | "10y";

export interface Simulation {
  id: string;
  type: SimulationType;
  scenario: string;
  timeframe: SimulationTimeframe;
  predictions: string[];
  confidence: number;
  riskScore: number;
  bestPath: string;
  warningSignals: string[];
  createdAt: number;
}
