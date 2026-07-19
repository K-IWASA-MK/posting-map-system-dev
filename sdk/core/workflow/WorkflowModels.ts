export type WorkflowNodeStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'SKIPPED'
  | 'CANCELLED';

export interface WorkflowNode {
  readonly nodeId: string;
  readonly type: string;
  readonly action: string;
  readonly config: Record<string, any>;
  readonly requiredCapabilities: string[];
}

export interface WorkflowEdge {
  readonly from: string;
  readonly to: string;
  readonly condition?: string;
}

export interface WorkflowVersion {
  readonly workflowId: string;
  readonly version: string;
  readonly checksum: string;
  readonly createdAt: string;
  readonly compatibleApplications: string[];
}

export interface WorkflowCheckpoint {
  readonly checkpointId: string;
  readonly workflowId: string;
  readonly nodeId: string;
  readonly executionState: Record<string, any>;
  readonly createdAt: string;
}

export interface WorkflowDefinition {
  readonly workflowId: string;
  readonly version: string;
  readonly nodes: WorkflowNode[];
  readonly edges: WorkflowEdge[];
  readonly entryNode: string;
  readonly exitNode: string;
  readonly approvalPolicy?: string;
  readonly status: 'ACTIVE' | 'INACTIVE';
}

export interface WorkflowNodeContract {
  readonly nodeId: string;
  readonly status: WorkflowNodeStatus;
  readonly retries: number;
  readonly timeoutMs: number;
}

export enum WorkflowState {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
