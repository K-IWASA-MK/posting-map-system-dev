import { LearningSourceRegistry } from './LearningSourceRegistry';
import { LearningSourceResolver } from './LearningSourceResolver';
import { LedgerLearningSource } from './sources/LedgerLearningSource';
import { TelemetryLearningSource } from './sources/TelemetryLearningSource';
import { MetricsLearningSource } from './sources/MetricsLearningSource';
import { CompositeLearningSource } from './sources/CompositeLearningSource';
import { IExecutionLedgerReader } from '../../ledger/ExecutionLedgerReader';
import { ITelemetryRepository } from '../../telemetry/ITelemetryRepository';
import { IMetricsRepository } from '../../metrics/IMetricsRepository';

export class LearningSourceFactory {
  public static create(
    ledgerReader: IExecutionLedgerReader,
    telemetryRepo: ITelemetryRepository,
    metricsRepo: IMetricsRepository
  ): { registry: LearningSourceRegistry; resolver: LearningSourceResolver } {
    const registry = new LearningSourceRegistry();

    // Instantiate concrete sources
    const ledgerSource = new LedgerLearningSource(ledgerReader);
    const telemetrySource = new TelemetryLearningSource(telemetryRepo);
    const metricsSource = new MetricsLearningSource(metricsRepo);
    
    // Register individual sources
    registry.register(ledgerSource);
    registry.register(telemetrySource);
    registry.register(metricsSource);

    // Register composite source
    const compositeSource = new CompositeLearningSource(registry);
    registry.register(compositeSource);

    const resolver = new LearningSourceResolver(registry);

    return {
      registry,
      resolver
    };
  }
}
