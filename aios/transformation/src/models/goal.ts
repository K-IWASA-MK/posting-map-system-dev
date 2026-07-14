export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum RiskLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface GoalDefinition {
  readonly id: string;
  readonly name: string;
  readonly priority: Priority;
  readonly deadline: string;
  readonly target: string;
  readonly successMetrics: readonly string[];
  readonly scope: readonly string[];
  readonly excluded: readonly string[];
  readonly risk: RiskLevel;
  readonly costLimit: string;
}
