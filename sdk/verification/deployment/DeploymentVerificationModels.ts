/**
 * DeploymentVerificationModels.ts
 * 
 * Deployment & CI/CD Verification Models
 */

export type GitHubWorkflowStatus = 'QUEUED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'CANCELLED';

export interface DeploymentVerificationRequest {
  readonly verificationId: string;
  readonly repository: string;
  readonly workflowName?: string;
  readonly productionUrl: string;
  readonly expectedCommit: string;
  readonly timeoutMs?: number;
}

export interface DeploymentVerificationResult {
  readonly verificationId: string;
  readonly status: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly workflowRunId: string;
  readonly workflowName: string;
  readonly workflowConclusion: GitHubWorkflowStatus;
  readonly deployedCommit: string;
  readonly expectedCommit: string;
  readonly commitMatch: boolean;
  readonly assetHashMatch: boolean;
  readonly productionResponseTimeMs: number;
  readonly evidence: {
    readonly workflowLogUrl?: string;
    readonly deployedHash?: string;
    readonly httpStatusCode?: number;
  };
  readonly error?: string;
}
