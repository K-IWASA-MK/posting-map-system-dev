import { ITelemetryRepository } from './ITelemetryRepository';
import { TelemetryRecord } from './TelemetryRecord';

export class InMemoryTelemetryRepository implements ITelemetryRepository {
  private records: Map<string, TelemetryRecord> = new Map();

  public async save(record: TelemetryRecord): Promise<void> {
    this.records.set(record.recordId, record);
  }

  public async findAll(): Promise<TelemetryRecord[]> {
    return Array.from(this.records.values());
  }

  public async findByExecutionId(executionId: string): Promise<TelemetryRecord[]> {
    return Array.from(this.records.values()).filter(r => r.executionId === executionId);
  }

  public async exists(recordId: string): Promise<boolean> {
    return this.records.has(recordId);
  }

  public async count(): Promise<number> {
    return this.records.size;
  }
}
