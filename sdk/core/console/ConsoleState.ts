export interface RuntimeStateProjection {
  runtimeId: string;
  runtimeName: string;
  version: string;
  status: string;
  health: string;
  uptimeMs: number;
  lastUpdatedAt: string;
}

export interface WorkflowStateProjection {
  workflowId: string;
  jobId: string;
  state: string; // RUNNING, COMPLETED, FAILED
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorReason?: string;
  activeSteps: string[];
  completedSteps: string[];
}

export interface MetricsProjection {
  runtimeMetrics: Record<string, any>;
  workflowMetrics: Record<string, any>;
  doraMetrics: Record<string, any>;
  queueMetrics: Record<string, any>;
}

export interface ConsoleState {
  runtimes: Map<string, RuntimeStateProjection>;
  workflows: Map<string, WorkflowStateProjection>;
  events: any[]; // Stream of AIOSEvents
  metrics: MetricsProjection;
  ledger: any[]; // Execution Ledger entries
  dependencyGraph: any; // Serialized dependency graph
}
