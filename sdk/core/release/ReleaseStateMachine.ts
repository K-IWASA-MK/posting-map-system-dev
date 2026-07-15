import { ReleaseState } from './ReleaseState';
import { ReleaseLedger } from './ledger/ReleaseLedger';
import { ReleaseLedgerEntryType } from './ledger/ReleaseLedgerEntryType';

export class ReleaseStateMachine {
  constructor(private ledger: ReleaseLedger) {}

  public async transition(releaseId: string, currentState: ReleaseState, newState: ReleaseState, error?: Error): Promise<ReleaseState> {
    if (newState === ReleaseState.FAILED) {
      await this.ledger.record(ReleaseLedgerEntryType.FAILED, { releaseId, error: error?.message, fromState: currentState });
      return ReleaseState.FAILED;
    }

    const validTransitions: Record<ReleaseState, ReleaseState[]> = {
      [ReleaseState.NEW]: [ReleaseState.VALIDATED, ReleaseState.FAILED],
      [ReleaseState.VALIDATED]: [ReleaseState.BUILDING, ReleaseState.FAILED],
      [ReleaseState.BUILDING]: [ReleaseState.PACKAGING, ReleaseState.FAILED],
      [ReleaseState.PACKAGING]: [ReleaseState.TAGGED, ReleaseState.FAILED],
      [ReleaseState.TAGGED]: [ReleaseState.PUBLISHED, ReleaseState.FAILED],
      [ReleaseState.PUBLISHED]: [ReleaseState.ARCHIVED],
      [ReleaseState.FAILED]: [ReleaseState.ARCHIVED],
      [ReleaseState.ARCHIVED]: []
    };

    if (!validTransitions[currentState].includes(newState)) {
      throw new Error(`Invalid release state transition from ${currentState} to ${newState}`);
    }

    // Ledger record specific transitions are typically recorded by the caller orchestrator or here,
    // but we will allow the state machine to be the gatekeeper.
    return newState;
  }
}
