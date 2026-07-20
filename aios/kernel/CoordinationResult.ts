export type RuntimeStage = string;

export interface CoordinationError {
  readonly code: string;
  readonly message: string;
}

export interface CoordinationResult {
  readonly accepted: boolean;
  readonly coordinationId: string;
  readonly nextStage: RuntimeStage;
  readonly targetAgents: readonly string[];
  readonly errors: readonly CoordinationError[];
}
