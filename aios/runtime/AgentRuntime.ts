import { LedgerEntry } from '../kernel/LedgerEntry';
import { ExecutionRequest } from './ExecutionRequest';

export class AgentRuntime {
  /**
   * Deterministically maps a verified LedgerEntry and target agent to an ExecutionRequest.
   * Throws an error if the input entry or target agent is invalid.
   */
  public static createSession(
    ledgerEntry: LedgerEntry,
    targetAgent: string
  ): ExecutionRequest {
    // Contract-01: Ledger Boundary Validation
    if (!ledgerEntry || !ledgerEntry.ledgerId || !ledgerEntry.currentHash) {
      throw new Error("AgentRuntime: Invalid or corrupt LedgerEntry.");
    }
    if (!targetAgent || targetAgent.trim() === "") {
      throw new Error("AgentRuntime: Target agent identifier cannot be empty.");
    }

    // Contract-04: Deterministic ID derivation (No timestamps or random strings in ID calculation)
    const sessionId = `session-${ledgerEntry.ledgerId}-${targetAgent}`;
    const requestId = `req-${sessionId}`;

    return {
      requestId,
      sessionId,
      agentId: targetAgent,
      protocolId: ledgerEntry.protocolId,
      protocolVersion: ledgerEntry.protocolVersion,
      runtimeStage: "EXECUTION"
    };
  }
}
