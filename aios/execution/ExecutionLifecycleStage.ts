export interface ExecutionLifecycleStage {
  readonly currentStage: string;
  readonly availableStages: readonly string[];
}
