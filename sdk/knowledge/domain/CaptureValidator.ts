/**
 * CaptureValidator.ts
 * 
 * AIOS Knowledge Capture Validator
 * Pure function evaluating LifecycleRecord compliance against CapturePolicy.
 */

import { LifecycleRecord } from '../../lifecycle';
import { CapturePolicy, CapturePolicyResolver } from './CapturePolicy';

export class CaptureValidator {
  /**
   * Evaluates if a LifecycleRecord is eligible for Knowledge Candidate extraction.
   * Stateless & Side-Effect Free.
   */
  public static validateCapture(
    lifecycle: LifecycleRecord,
    policy?: CapturePolicy
  ): { valid: boolean; reason?: string } {
    if (!lifecycle) {
      return { valid: false, reason: 'LifecycleRecord is required.' };
    }

    const effectivePolicy = policy || CapturePolicyResolver.getDefaultPolicy();

    if (!effectivePolicy.enabled) {
      return { valid: false, reason: 'Knowledge Capture Policy is disabled.' };
    }

    if (lifecycle.currentState !== effectivePolicy.requiredState) {
      return {
        valid: false,
        reason: `Lifecycle state [${lifecycle.currentState}] does not match required state [${effectivePolicy.requiredState}].`
      };
    }

    if (lifecycle.outcome !== effectivePolicy.minimumOutcome) {
      return {
        valid: false,
        reason: `Lifecycle outcome [${lifecycle.outcome}] does not meet minimum required outcome [${effectivePolicy.minimumOutcome}].`
      };
    }

    return { valid: true };
  }
}
