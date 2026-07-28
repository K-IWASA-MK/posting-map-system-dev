/**
 * CapturePolicy.ts
 * 
 * AIOS Knowledge Capture Policy
 * Defines policy criteria for extracting KnowledgeCandidates from successful task lifecycles.
 */

import { TaskOutcome, TaskState } from '../../lifecycle';

export interface CapturePolicy {
  readonly enabled: boolean;
  readonly minimumOutcome: TaskOutcome;
  readonly requiredState: TaskState;
  readonly duplicateCheck: boolean;
  readonly minConfidence: number;
}

export class CapturePolicyResolver {
  private static readonly DEFAULT_POLICY: CapturePolicy = Object.freeze({
    enabled: true,
    minimumOutcome: 'SUCCESS',
    requiredState: 'COMPLETED',
    duplicateCheck: false,
    minConfidence: 0.8
  });

  /**
   * Deterministically returns the standard default CapturePolicy.
   */
  public static getDefaultPolicy(): CapturePolicy {
    return CapturePolicyResolver.DEFAULT_POLICY;
  }
}
