export interface ExecutionToken {
  tokenId: string;
  executionId: string;
  sessionId: string;
  issuerNode: string;
  targetNode: string;
  workflowId: string;
  applicationId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  signature: string;
}

export enum AttestationState {
  REQUESTED = 'REQUESTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface RemoteAttestation {
  nodeId: string;
  trustScore: number;
  certificateId: string;
  runtimeIntegrity: boolean;
  containerIntegrity: boolean;
  verifiedAt: string;
  state?: AttestationState;
}

export enum DistributedFailurePolicy {
  RETRY_LOCAL = 'RETRY_LOCAL',
  RETRY_REMOTE = 'RETRY_REMOTE',
  FAILOVER = 'FAILOVER',
  ABORT = 'ABORT'
}

export interface ExecutionResultProof {
  executionId: string;
  nodeId: string;
  resultHash: string;
  completedAt: string;
  signature: string;
  attestationId: string;
}

export interface DistributedExecutionRecord {
  executionId: string;
  sourceNode: string;
  targetNode: string;
  status: string;
  startedAt: string;
  completedAt: string;
  attestation: RemoteAttestation;
  proof?: ExecutionResultProof;
}

export interface NodeCapabilityProfile {
  nodeId: string;
  cpu: number;
  memory: number;
  gpu: number;
  runtimeClasses: string[];
  runtimeCapabilities: string[];
  supportedPolicies: string[];
  trustScore: number;
}
