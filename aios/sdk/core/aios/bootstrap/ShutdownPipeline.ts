import { IExecutionLedgerWriter } from '../ledger/ExecutionLedgerWriter';

export class ShutdownPipeline {
  public async execute(ledgerWriter: IExecutionLedgerWriter): Promise<void> {
    // 1. Stop Accepting Requests
    // 2. Wait for active sessions (Optional/Future)
    // 3. Flush Ledger
    await ledgerWriter.flush();
    // 4. Close Adapters
  }
}
