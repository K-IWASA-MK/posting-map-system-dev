import { EventBus } from '../../eventbus/EventBus';
import { InMemoryTelemetryRepository } from '../../telemetry/InMemoryTelemetryRepository';
import { InMemoryProjectionRepository } from '../../projection/InMemoryProjectionRepository';
import { InMemoryMetricsRepository } from '../../metrics/InMemoryMetricsRepository';
import { MonitorFactory } from '../../monitor/MonitorFactory';
import { LearningSourceFactory } from '../../learning/source/LearningSourceFactory';
import { IExecutionLedgerReader } from '../../ledger/ExecutionLedgerReader';
import { ObservabilityRuntime } from './ObservabilityRuntime';
import { ObservabilityConfiguration } from './ObservabilityConfiguration';

export class ObservabilityFactory {
  private ledgerReader: IExecutionLedgerReader;

  constructor(ledgerReader: IExecutionLedgerReader) {
    this.ledgerReader = ledgerReader;
  }

  public createRuntime(
    configuration: ObservabilityConfiguration,
    initLog: string[] = [] // Optional trace array to verify deterministic initialization order in tests
  ): ObservabilityRuntime {
    const runtimeId = `RUN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const bootTime = new Date().toISOString();

    // 1. Initialize EventBus
    initLog.push('EventBus');
    const eventBus = new EventBus();

    // 2. Initialize Telemetry
    initLog.push('Telemetry');
    const telemetryRepository = new InMemoryTelemetryRepository();

    // 3. Initialize Projection
    initLog.push('Projection');
    const projectionRepository = new InMemoryProjectionRepository();

    // 4. Initialize Metrics
    initLog.push('Metrics');
    const metricsRepository = new InMemoryMetricsRepository();

    // 5. Initialize LiveMonitor
    initLog.push('LiveMonitor');
    const liveMonitor = MonitorFactory.create(projectionRepository, metricsRepository);

    // 6. Initialize LearningSource
    initLog.push('LearningSource');
    const { registry: learningRegistry, resolver: learningResolver } = LearningSourceFactory.create(
      this.ledgerReader,
      telemetryRepository,
      metricsRepository
    );

    return new ObservabilityRuntime(
      runtimeId,
      bootTime,
      configuration,
      eventBus,
      telemetryRepository,
      projectionRepository,
      metricsRepository,
      liveMonitor,
      learningRegistry,
      learningResolver
    );
  }
}
