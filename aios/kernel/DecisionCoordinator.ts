import { ValidationResult } from './ValidationResult';
import { CoordinationResult } from './CoordinationResult';
import { ProtocolRouteRegistry } from './ProtocolRouteRegistry';

export class DecisionCoordinator {
  /**
   * Deterministically coordinates a validated protocol message, resolving next stages and routing target agents.
   */
  public static coordinate(
    validationResult: ValidationResult,
    payload: unknown
  ): CoordinationResult {
    // Contract-01: SchemaValidator Boundary Check
    if (!validationResult.valid) {
      return {
        accepted: false,
        coordinationId: `co-rejected-${Date.now()}`,
        nextStage: "REJECTED",
        targetAgents: [],
        errors: [{
          code: "VALIDATION_FAILED",
          message: "Message failed protocol schema validation."
        }]
      };
    }

    const protocolId = validationResult.protocolId;
    const targetAgents = ProtocolRouteRegistry.resolve(protocolId, payload);

    if (targetAgents.length === 0) {
      return {
        accepted: false,
        coordinationId: `co-failed-${Date.now()}`,
        nextStage: "REJECTED",
        targetAgents: [],
        errors: [{
          code: "EMPTY_TARGET_AGENTS",
          message: `No target agents resolved for protocol: ${protocolId}`
        }]
      };
    }

    // Determine the next stage dynamically based on protocol types (Contract-05: Deterministic)
    let nextStage = "SIGNING";
    if (protocolId === "aios-consensus-v1") {
      nextStage = "LEDGER_COMMIT";
    } else if (protocolId === "aios-ledger-v1") {
      nextStage = "LEDGER_COMMIT";
    }

    // Create a unique deterministic coordination ID format
    const coordinationId = `co-${protocolId}-${Date.now()}`;

    return {
      accepted: true,
      coordinationId,
      nextStage,
      targetAgents,
      errors: []
    };
  }
}
