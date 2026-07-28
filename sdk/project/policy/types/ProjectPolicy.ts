/**
 * ProjectPolicy.ts
 * 
 * Execution and Governance Policy declared per client project
 */

export interface ProjectPolicy {
  maxParallelWorkflow: number;
  requiresHumanApproval: boolean;
  allowRetry: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  timeoutMs: number;
}
