export interface ResourceAllocation {
  allocationId: string;
  cpu: number;        // CPU share or cores
  memory: number;     // Memory in MB
  gpu: number;        // GPU count
  storage: number;    // Storage in GB
  network: number;    // Bandwidth in Mbps
  placement: string;  // Target node/host ID
}

export interface PlacementPolicy {
  policyId: string;
  strategy: 'SPREAD' | 'BINPACK' | 'AFFINITY' | 'ANTI_AFFINITY';
  affinity?: string[];
  antiAffinity?: string[];
  constraints?: Record<string, any>;
}

export interface ScalingPolicy {
  policyId: string;
  minReplicas: number;
  maxReplicas: number;
  cpuThreshold: number;       // CPU upper threshold (%)
  memoryThreshold: number;    // Memory upper threshold (%)
  queueThreshold: number;     // Queue depth threshold
  cooldown: number;           // Cooldown duration (seconds)
}

export interface OrchestrationPlan {
  planId: string;
  applicationId: string;
  workflowId?: string;
  placementPolicy: PlacementPolicy;
  resourceAllocation: ResourceAllocation;
  scalingPolicy: ScalingPolicy;
  status: 'PLANNING' | 'ACTIVE' | 'TERMINATED';
  createdAt: string;
}

export interface ExecutionQueueItem {
  queueId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  workflowId: string;
  applicationId: string;
  requestedResources: ResourceAllocation;
  deadline?: string;         // ISO8601 target completion time
  retryCount: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export enum SchedulingPolicy {
  FIFO = 'FIFO',
  PRIORITY = 'PRIORITY',
  DEADLINE = 'DEADLINE',
  FAIR_SHARE = 'FAIR_SHARE',
  ROUND_ROBIN = 'ROUND_ROBIN'
}

export enum ScalingDecisionReason {
  CPU_THRESHOLD = 'CPU_THRESHOLD',
  MEMORY_THRESHOLD = 'MEMORY_THRESHOLD',
  GPU_THRESHOLD = 'GPU_THRESHOLD',
  QUEUE_DEPTH = 'QUEUE_DEPTH',
  MANUAL_REQUEST = 'MANUAL_REQUEST',
  RECOVERY = 'RECOVERY'
}

export interface ScalingDecision {
  decisionId: string;
  policyId: string;
  action: 'SCALE_OUT' | 'SCALE_IN' | 'NO_OP';
  replicasDelta: number;
  reason: ScalingDecisionReason;
  details: string;
  timestamp: string;
}

export enum RecoveryState {
  DETECTED = 'DETECTED',
  PLANNED = 'PLANNED',
  MIGRATING = 'MIGRATING',
  RECOVERING = 'RECOVERING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface RecoveryPlan {
  recoveryId: string;
  targetId: string; // Workflow or Application ID
  failureReason: string;
  steps: string[];
  status: RecoveryState;
  createdAt: string;
}
