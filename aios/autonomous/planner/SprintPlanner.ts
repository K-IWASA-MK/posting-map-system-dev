import { AutonomousTriggerRequest } from "../contracts/AutonomousTriggerContract";
import { SprintProposal } from "../contracts/AutonomousSprintContract";

export class SprintPlanner {
  /**
   * Formulates a concrete SprintProposal based on trigger details.
   */
  public plan(request: AutonomousTriggerRequest): SprintProposal {
    const payload = request.payload || {};

    const sprintName = payload.sprintName || `Sprint-${request.proposalId}`;
    const targetRuntime = payload.targetRuntime || "ExecutionRuntime";
    const fileScope = payload.fileScope || [];
    const riskLevel = payload.riskLevel || "LOW";
    const permissionScope = payload.permissionScope || ["READ_ONLY"];

    return {
      proposalId: request.proposalId,
      sprintName,
      targetRuntime,
      fileScope,
      riskLevel,
      permissionScope,
      payload
    };
  }
}
