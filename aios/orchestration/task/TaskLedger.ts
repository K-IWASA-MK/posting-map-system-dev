import { TaskLedgerEntry } from './TaskTypes';
import { IntentDecision } from '../executive/ExecutiveTypes';

export class TaskLedger {
  private readonly ledger: Map<string, TaskLedgerEntry> = new Map();

  /**
   * Records an IntentDecision and Task ID into the TaskLedger.
   */
  public record(taskId: string, decision: IntentDecision): TaskLedgerEntry {
    if (!taskId || !decision) {
      throw new Error('[TaskLedger] Invalid taskId or IntentDecision provided for recording.');
    }

    const ledgerId = `TL-${Date.now()}-${this.ledger.size + 1}`;
    const entry: TaskLedgerEntry = {
      ledgerId,
      taskId,
      requester: "CEO",
      intentSummary: decision.rawInput,
      selectedProjectId: decision.selectedProjectId || "UNRESOLVED",
      decisionReasoning: decision.reasoning,
      riskLevel: decision.riskLevel,
      timestamp: Date.now()
    };

    this.ledger.set(ledgerId, entry);
    return entry;
  }

  /**
   * Resolves a TaskLedgerEntry by ledgerId.
   */
  public get(ledgerId: string): TaskLedgerEntry | undefined {
    return this.ledger.get(ledgerId);
  }

  /**
   * Resolves TaskLedgerEntry records for a specific taskId.
   */
  public getByTaskId(taskId: string): readonly TaskLedgerEntry[] {
    const results: TaskLedgerEntry[] = [];
    this.ledger.forEach(entry => {
      if (entry.taskId === taskId) {
        results.push(entry);
      }
    });
    return results;
  }

  /**
   * Lists all recorded TaskLedger entries.
   */
  public list(): readonly TaskLedgerEntry[] {
    return Array.from(this.ledger.values());
  }

  /**
   * Clears the current ledger. Intended for testing or isolated runtime resets.
   */
  public clear(): void {
    this.ledger.clear();
  }
}
