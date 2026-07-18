export class AutonomousLoopGuard {
  private static readonly MAX_RETRY = 1;
  private static readonly MAX_CHAIN_DEPTH = 1;

  // Track Sprint history: proposalId -> execution details
  private readonly history = new Map<
    string,
    {
      status: "RUNNING" | "COMPLETED" | "FAILED";
      executionCount: number;
      errorSignatures: Set<string>;
      chainDepth: number;
    }
  >();

  /**
   * Asserts whether a sprint run is allowed, or if it triggers loop protection rules.
   */
  public evaluate(proposalId: string, errorSignature?: string): { allowed: boolean; reason?: string } {
    const record = this.history.get(proposalId);

    // 1. Initial run is always allowed
    if (!record) {
      return { allowed: true };
    }

    // 2. Detect same error correction loop (highest priority check)
    if (errorSignature && record.errorSignatures.has(errorSignature)) {
      return {
        allowed: false,
        reason: `Loop Guard Block: Identical error signature '${errorSignature}' detected. Preventing infinite self-correction loop.`
      };
    }

    // 3. Prevent execution after Completion
    if (record.status === "COMPLETED") {
      return { allowed: false, reason: `Loop Guard Block: Proposal ${proposalId} has already completed successfully.` };
    }

    // 4. Max Retry limits
    if (record.executionCount > AutonomousLoopGuard.MAX_RETRY) {
      return {
        allowed: false,
        reason: `Loop Guard Block: Max retry limit reached (${record.executionCount} > ${AutonomousLoopGuard.MAX_RETRY}) for proposal ${proposalId}.`
      };
    }

    // 5. Max Chain Depth limits
    if (record.chainDepth > AutonomousLoopGuard.MAX_CHAIN_DEPTH) {
      return {
        allowed: false,
        reason: `Loop Guard Block: Max execution chain depth reached (${record.chainDepth} > ${AutonomousLoopGuard.MAX_CHAIN_DEPTH}).`
      };
    }

    return { allowed: true };
  }

  /**
   * Registers a sprint start event.
   */
  public recordStart(proposalId: string): void {
    const record = this.history.get(proposalId);
    if (!record) {
      this.history.set(proposalId, {
        status: "RUNNING",
        executionCount: 1,
        errorSignatures: new Set<string>(),
        chainDepth: 0
      });
    } else {
      record.status = "RUNNING";
      record.executionCount++;
      record.chainDepth++;
    }
  }

  /**
   * Registers a sprint completion or failure event.
   */
  public recordResult(proposalId: string, status: "COMPLETED" | "FAILED", errorSignature?: string): void {
    const record = this.history.get(proposalId);
    if (!record) {
      return;
    }
    record.status = status;
    if (status === "FAILED" && errorSignature) {
      record.errorSignatures.add(errorSignature);
    }
  }

  public clear(): void {
    this.history.clear();
  }
}
