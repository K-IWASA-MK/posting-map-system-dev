import { InitializationTask } from "./InitializationTask";

export type InitializationState =
  | "REQUESTED"
  | "DATA_ACQUIRED"
  | "MASTER_READY"
  | "AREA_READY"
  | "ELECTION_READY"
  | "DASHBOARD_READY"
  | "VISUALIZATION_READY"
  | "COMPLETED"
  | "FAILED";

export interface InitializationExecutionLedger {
  readonly requestId: string;
  readonly districtName: string;
  readonly districtId: string;
  readonly state: InitializationState;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly tasks: readonly InitializationTask[];
}

export class InitializationStateStore {
  private ledger: InitializationExecutionLedger;

  constructor(requestId: string, districtName: string, districtId: string) {
    this.ledger = Object.freeze({
      requestId,
      districtName,
      districtId,
      state: "REQUESTED",
      startedAt: new Date().toISOString(),
      tasks: Object.freeze([])
    });
  }

  /**
   * Retrieves the current immutable ledger snapshot.
   */
  public getLedger(): InitializationExecutionLedger {
    return this.ledger;
  }

  /**
   * Updates state and registers task snapshots, returning the new immutable ledger.
   */
  public updateState(newState: InitializationState, tasks: readonly InitializationTask[]): InitializationExecutionLedger {
    const isTerminal = newState === "COMPLETED" || newState === "FAILED";
    this.ledger = Object.freeze({
      ...this.ledger,
      state: newState,
      tasks: Object.freeze([...tasks]),
      completedAt: isTerminal ? new Date().toISOString() : this.ledger.completedAt
    });
    return this.ledger;
  }
}
