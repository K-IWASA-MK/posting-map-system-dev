export interface SprintProposal {
  readonly proposalId: string;
  readonly sprintName: string;
  readonly targetRuntime: string;
  readonly fileScope: readonly string[];
  readonly riskLevel: "LOW" | "MEDIUM" | "HIGH";
  readonly permissionScope: readonly string[];
  readonly payload?: Record<string, any>;
}

export interface AutonomousControlState {
  readonly enabled: boolean;
  readonly emergencyStop: boolean;
  readonly maxRiskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface AutonomousExecutionBudget {
  readonly maxExecutionMinutes: number;
  readonly maxSprintCount: number;
  readonly maxCommitCount: number;
  readonly maxReleaseCount: number;
  readonly cooldownMinutes: number;
}
