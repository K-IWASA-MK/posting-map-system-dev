import { TelemetryCollector } from './TelemetryCollector';
import { InMemoryTelemetryRepository } from './InMemoryTelemetryRepository';
import { TelemetryDispatcher } from './TelemetryDispatcher';

export class TelemetryFactory {
  public static createInMemory() {
    const repository = new InMemoryTelemetryRepository();
    const collector = new TelemetryCollector(repository);
    const dispatcher = new TelemetryDispatcher(collector);
    
    return {
      repository,
      collector,
      dispatcher
    };
  }
}
