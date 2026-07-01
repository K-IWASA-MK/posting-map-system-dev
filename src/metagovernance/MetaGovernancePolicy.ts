import { MetaGovernanceStatus } from "./MetaGovernanceStatus";

export interface MetaGovernancePolicy {
  policyId: string;
  scope: string;
  priority: number;
  constraints: string[];
  dependencies: string[];
}

export interface GovernanceDecision {
  decisionId: string;
  policyRef: string;
  affectedLayer: string;
  decisionType: string;
  justification: string;
  status: MetaGovernanceStatus;
}

export interface MetaGovernanceContext {
  runtimeId: string;
  globalGraphSnapshotId: string;
  activePolicies: string[];
  conflictGraphRef: string;
}
