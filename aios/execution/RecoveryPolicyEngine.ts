import { TaskRiskLevel } from '../orchestration/executive/ExecutiveTypes';
import { SandboxValidationResult, RecoveryDecision } from './WorkforceExecutionTypes';

/**
 * RecoveryPolicyEngine decides the recovery action (PROCEED, RETRY, or HALT)
 * when a SandboxValidationResult violation occurs, based on TaskRiskLevel.
 */
export class RecoveryPolicyEngine {
  /**
   * Resolves the recovery decision for a sandbox validation violation.
   *
   * @param validation Result from SandboxBoundaryEnforcer
   * @param riskLevel Risk level of the current task
   * @param currentViolationCount Number of violations previously occurred in this session
   */
  public static resolveDecision(
    validation: SandboxValidationResult,
    riskLevel: TaskRiskLevel,
    currentViolationCount: number
  ): RecoveryDecision {
    if (validation.allowed) {
      return {
        action: "PROCEED",
        reason: "Access allowed.",
        attemptsRemaining: 1
      };
    }

    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      return {
        action: "HALT",
        reason: `Immediate Halt policy applied for HIGH risk task on violation: ${validation.reason}`,
        attemptsRemaining: 0
      };
    }

    if (riskLevel === "MEDIUM") {
      if (currentViolationCount === 0) {
        return {
          action: "RETRY",
          reason: `Medium Risk policy: 1 Retry allowed with warning. ${validation.reason}`,
          attemptsRemaining: 0
        };
      }
      return {
        action: "HALT",
        reason: `Medium Risk policy: Second violation exceeded allowed retries. ${validation.reason}`,
        attemptsRemaining: 0
      };
    }

    // LOW Risk Policy
    if (currentViolationCount === 0) {
      return {
        action: "RETRY",
        reason: `Low Risk policy: Warning issued, retry permitted for path path correction. ${validation.reason}`,
        attemptsRemaining: 0
      };
    }

    return {
      action: "HALT",
      reason: `Low Risk policy: Exceeded max allowed retries (1). ${validation.reason}`,
      attemptsRemaining: 0
    };
  }
}
