/**
 * AssignmentModels.ts
 * 
 * AIOS Task Dispatcher Assignment Contract Foundation Model
 * Immutable AssignmentContract generated deterministically by Task Dispatcher.
 */

import { AgentProfile, CapabilityType } from './AgentModels';

export type AssignmentReasonCode =
  | 'ROLE_MATCH'
  | 'EXACT_CAPABILITY_MATCH'
  | 'PARTIAL_CAPABILITY_MATCH'
  | 'DEFAULT_ROLE_FALLBACK'
  | 'PRIORITY_WEIGHT_BOOST';

export interface AssignmentContract {
  readonly assignmentId: string;
  readonly taskId: string;
  readonly requiredRole: string;
  readonly requiredCapabilities: ReadonlyArray<CapabilityType>;
  readonly selectedAgent: AgentProfile;
  readonly matchScore: number;
  readonly reasonCodes: ReadonlyArray<AssignmentReasonCode>;
  readonly createdAt: string;
}
