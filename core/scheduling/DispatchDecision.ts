export interface DispatchDecision {
  readonly ticketId: string;
  readonly reason: string;
  readonly priorityScore: number;
  readonly dependencyScore: number;
  readonly resourceScore: number;
  readonly policyScore: number;
  readonly decidedAt: number;
}
