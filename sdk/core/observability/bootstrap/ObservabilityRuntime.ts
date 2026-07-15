import { ObservabilityConfiguration } from './ObservabilityConfiguration';
import { EventBus } from '../../eventbus/EventBus';
import { InMemoryTelemetryRepository } from '../../telemetry/InMemoryTelemetryRepository';
import { InMemoryProjectionRepository } from '../../projection/InMemoryProjectionRepository';
import { InMemoryMetricsRepository } from '../../metrics/InMemoryMetricsRepository';
import { LiveMonitor } from '../../monitor/LiveMonitor';
import { LearningSourceRegistry } from '../../learning/source/LearningSourceRegistry';
import { LearningSourceResolver } from '../../learning/source/LearningSourceResolver';

export class ObservabilityRuntime {
  public readonly runtimeId: string;
  public readonly bootTime: string;
  public readonly configuration: ObservabilityConfiguration;

  public readonly eventBus: EventBus;
  public readonly telemetryRepository: InMemoryTelemetryRepository;
  public readonly projectionRepository: InMemoryProjectionRepository;
  public readonly metricsRepository: InMemoryMetricsRepository;
  public readonly liveMonitor: LiveMonitor;
  public readonly learningRegistry: LearningSourceRegistry;
  public readonly learningResolver: LearningSourceResolver;

  constructor(
    runtimeId: string,
    bootTime: string,
    configuration: ObservabilityConfiguration,
    eventBus: EventBus,
    telemetryRepository: InMemoryTelemetryRepository,
    projectionRepository: InMemoryProjectionRepository,
    metricsRepository: InMemoryMetricsRepository,
    liveMonitor: LiveMonitor,
    learningRegistry: LearningSourceRegistry,
    learningResolver: LearningSourceResolver
  ) {
    this.runtimeId = runtimeId;
    this.bootTime = bootTime;
    this.configuration = configuration;
    this.eventBus = eventBus;
    this.telemetryRepository = telemetryRepository;
    this.projectionRepository = projectionRepository;
    this.metricsRepository = metricsRepository;
    this.liveMonitor = liveMonitor;
    this.learningRegistry = learningRegistry;
    this.learningResolver = learningResolver;
  }
}
