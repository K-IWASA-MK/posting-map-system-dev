import { DistributedExecutionRecord, ExecutionResultProof } from './ExecutionToken';

export class DistributedExecutionRegistry {
  private records = new Map<string, DistributedExecutionRecord>();
  private proofs = new Map<string, ExecutionResultProof>();

  public register(record: DistributedExecutionRecord): void {
    this.records.set(record.executionId, record);
  }

  public getRecord(executionId: string): DistributedExecutionRecord | undefined {
    return this.records.get(executionId);
  }

  public registerProof(proof: ExecutionResultProof): void {
    this.proofs.set(proof.executionId, proof);
    const record = this.records.get(proof.executionId);
    if (record) {
      this.records.set(proof.executionId, {
        ...record,
        status: 'COMPLETED',
        completedAt: proof.completedAt,
        proof
      });
    }
  }

  public getProof(executionId: string): ExecutionResultProof | undefined {
    return this.proofs.get(executionId);
  }
}
