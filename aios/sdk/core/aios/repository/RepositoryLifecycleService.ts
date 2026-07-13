import { RepositoryState } from './RepositoryState';
import { RepositoryRecord } from './RepositoryRecord';
import { IExecutionLedgerWriter } from '../ledger/ExecutionLedgerWriter';
import { ExecutionLedgerEntryType } from '../ledger/ExecutionLedgerEntryType';

export class RepositoryLifecycleService {
  constructor(private ledger: IExecutionLedgerWriter) {}

  public async transition(record: RepositoryRecord, newState: RepositoryState, details?: any): Promise<void> {
    record.state = newState;
    
    // Convert State to Ledger Entry Type
    let entryType = ExecutionLedgerEntryType.SYSTEM;
    switch (newState) {
      case RepositoryState.CREATED: entryType = ExecutionLedgerEntryType.REPOSITORY_CREATED; break;
      case RepositoryState.PUSHED: entryType = ExecutionLedgerEntryType.REPOSITORY_PUSHED; break;
      case RepositoryState.READY: entryType = ExecutionLedgerEntryType.REPOSITORY_SYNCED; break; // Approximated
      case RepositoryState.ARCHIVED: entryType = ExecutionLedgerEntryType.REPOSITORY_ARCHIVED; break;
      case RepositoryState.DELETED: entryType = ExecutionLedgerEntryType.REPOSITORY_DELETED; break;
      case RepositoryState.FAILED: entryType = ExecutionLedgerEntryType.REPOSITORY_FAILED; break;
    }

    await this.ledger.append({
      entryId: `lifecycle-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      executionId: record.id,
      correlationId: record.id,
      timestamp: new Date().toISOString(),
      entryType,
      payload: Object.freeze({
        state: newState,
        repositoryName: record.manifest.repositoryName,
        ...details
      }),
      version: 'v1',
      sequenceNo: Date.now()
    });
  }
}
