export interface SimulationPolicy {
  readonly requireSimulation: boolean;
  readonly maxSimulationTimeMs: number;
  readonly minimumPassingScore: number;
  readonly allowedRisks: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
}
