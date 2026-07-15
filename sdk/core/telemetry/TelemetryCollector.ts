import { ITelemetryCollector } from './ITelemetryCollector';
import { ITelemetryRepository } from './ITelemetryRepository';
import { TelemetryRecord } from './TelemetryRecord';

export class TelemetryCollector implements ITelemetryCollector {
  private repository: ITelemetryRepository;

  constructor(repository: ITelemetryRepository) {
    this.repository = repository;
  }

  public async collect(record: TelemetryRecord): Promise<void> {
    this.validate(record);
    await this.repository.save(record);
  }

  private validate(record: TelemetryRecord): void {
    if (typeof record.value !== 'number' || isNaN(record.value)) {
      throw new Error(`Validation Error: Telemetry value must be a valid number. Got ${typeof record.value}`);
    }
    
    // Check immutability helper: try mutating key fields (will fail if object is frozen)
    if (!Object.isFrozen(record)) {
      throw new Error('Validation Error: TelemetryRecord must be frozen (immutable).');
    }
  }
}
