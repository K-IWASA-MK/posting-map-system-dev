export interface GovernanceRequest {
  requestId: string;
  sourceLayer: string;
  targetScope: string;
  payload: Record<string, any>;
  priority: string;
  timestamp: string;
}

export interface GovernanceDecisionPacket {
  decisionId: string;
  requestRef: string;
  policyRef: string;
  outcome: string;
  confidence: number;
  reasoningGraphRef: string;
}

export interface GovernanceKernelContext {
  runtimeId: string;
  metaGovernanceStateRef: string;
  activePolicySet: string[];
  systemGraphSnapshotId: string;
}
