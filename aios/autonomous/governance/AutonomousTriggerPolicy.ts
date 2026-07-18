import { SprintProposal } from "../contracts/AutonomousSprintContract";

export class AutonomousTriggerPolicy {
  // Policy rules: Allowed targets and paths
  private static readonly ALLOWED_RUNTIMES = new Set([
    "ExecutionRuntime",
    "ValidationRuntime",
    "AuditRuntime",
    "LearningRuntime",
    "CompletionRuntime",
    "ReleaseRuntime"
  ]);

  private static readonly ALLOWED_PATH_PREFIXES = [
    "projects/posting-map/",
    "tests/",
    "docs/"
  ];

  private static readonly RESTRICTED_PATH_PREFIXES = [
    "aios/",
    "kernel/",
    "core/",
    "sdk/"
  ];

  /**
   * Evaluates a sprint proposal against firewall rules.
   */
  public evaluate(proposal: SprintProposal): { allowed: boolean; reason?: string } {
    // 1. Target Runtime Validation
    if (!AutonomousTriggerPolicy.ALLOWED_RUNTIMES.has(proposal.targetRuntime)) {
      return { allowed: false, reason: `Policy Block: Runtime '${proposal.targetRuntime}' is not an authorized autonomous target.` };
    }

    // 2. File Scope Validation (Directory boundary firewall)
    for (const filePath of proposal.fileScope) {
      // Must not target core/security layers directly
      const isRestricted = AutonomousTriggerPolicy.RESTRICTED_PATH_PREFIXES.some(prefix => filePath.startsWith(prefix));
      if (isRestricted) {
        return { allowed: false, reason: `Policy Block: File path '${filePath}' modifies restricted system core/security directories.` };
      }

      // Must target allowed directories
      const isAllowed = AutonomousTriggerPolicy.ALLOWED_PATH_PREFIXES.some(prefix => filePath.startsWith(prefix));
      if (!isAllowed) {
        return { allowed: false, reason: `Policy Block: File path '${filePath}' falls outside the allowed workspace scope.` };
      }
    }

    // 3. Permission Scope Validation
    const invalidPermissions = proposal.permissionScope.filter(p => p === "ADMIN" || p === "ROOT" || p === "WRITE_PRODUCTION");
    if (invalidPermissions.length > 0) {
      return { allowed: false, reason: `Policy Block: Requested elevated permissions: ${invalidPermissions.join(", ")} are unauthorized for autonomous runtimes.` };
    }

    // 4. Release execution validation based on Risk
    if (proposal.targetRuntime === "ReleaseRuntime" && proposal.riskLevel === "HIGH") {
      return { allowed: false, reason: "Policy Block: HIGH risk proposals are blocked from autonomous Release execution." };
    }

    return { allowed: true };
  }
}
