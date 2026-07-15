import { TelemetryRecord } from './TelemetryRecord';

export interface ITelemetryRepository {
  save(record: TelemetryRecord): Promise<void>;
  findAll(): Promise<TelemetryRecord[]>;
  findByExecutionId(executionId: string): Promise<TelemetryRecord[]>;
  exists(recordId: string): Promise<boolean>;
  count(): Promise<number>;
}
