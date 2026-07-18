import { RuntimeEvent } from "../contracts/RuntimeEventContract";

export class IntegrationPolicy {
  /**
   * Asserts whether the event payload permits the transition to the next runtime.
   * Ensures quality gate failures block sequential loops deterministically.
   */
  public static isTransitionAllowed(event: RuntimeEvent): { allowed: boolean; reason?: string } {
    const { eventType, payload } = event;

    // Execution Completed transition rules
    if (eventType === "EXECUTION_COMPLETED" && payload.status === "FAILED") {
      return { allowed: false, reason: "Orchestration blocked: Execution status is FAILED." };
    }

    // Validation Completed transition rules
    if (eventType === "VALIDATION_COMPLETED" && payload.status === "INVALID") {
      return { allowed: false, reason: "Orchestration blocked: Validation status is INVALID." };
    }

    // Audit Completed transition rules
    if (eventType === "AUDIT_RECORDED" && payload.status === "FAILED") {
      return { allowed: false, reason: "Orchestration blocked: Audit recording status is FAILED." };
    }

    // Completion Completed transition rules (WARNING is allowed since it's non-blocking)
    if (eventType === "COMPLETION_COMPLETED") {
      if (payload.status === "FAILED") {
        return { allowed: false, reason: "Orchestration blocked: Completion status is FAILED." };
      }
      if (payload.status === "BLOCKED") {
        return { allowed: false, reason: "Orchestration blocked: Completion status is BLOCKED." };
      }
    }

    return { allowed: true };
  }
}
