import { AIOSEvent } from '../../event/AIOSEvent';
import { 
  ObservabilityRecord, 
  LogRecord, 
  TraceRecord, 
  AlertRecord, 
  MetricsRecord, 
  PlatformHealthStatus, 
  AlertRule, 
  AlertSeverity 
} from '../ObservabilityRecord';
import { ObservabilityRegistry } from '../ObservabilityRegistry';
import { RuntimeHealthStatus } from '../../runtime/RuntimeHealth';
import { RuntimeState } from '../../runtime/RuntimeState';

// Deep Freeze Helper
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || obj === undefined) return obj;
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

// 1. Collector Interface & Implementation
export interface ICollector {
  collect(event: AIOSEvent): any;
}

export class TelemetryCollector implements ICollector {
  collect(event: AIOSEvent): any {
    return {
      id: event.eventId,
      type: event.eventType,
      producer: event.producerRuntimeId,
      time: event.occurredAt,
      payload: event.payload,
      correlation: event.correlationId,
      causation: event.causationId,
      state: event.state
    };
  }
}

// 2. Normalizer Interface & Implementation
export interface INormalizer {
  normalize(raw: any): ObservabilityRecord;
}

export class TelemetryNormalizer implements INormalizer {
  normalize(raw: any): ObservabilityRecord {
    return {
      recordId: raw.id || `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: raw.time || new Date().toISOString(),
      runtimeId: raw.producer || 'unknown',
      source: raw.producer || 'unknown',
      category: raw.type || 'generic',
      severity: this.resolveSeverity(raw.type, raw.payload)
    };
  }

  private resolveSeverity(type: string, payload: any): string {
    if (type.includes('Failed') || type.includes('Error') || (payload && payload.error)) {
      return 'ERROR';
    }
    if (type.includes('Warning') || type.includes('Degraded')) {
      return 'WARNING';
    }
    return 'INFO';
  }
}

// 3. Enricher Interface & Implementation
export interface IEnricher {
  enrich(record: ObservabilityRecord, rawEvent: any): ObservabilityRecord;
}

export class TelemetryEnricher implements IEnricher {
  enrich(record: ObservabilityRecord, rawEvent: any): ObservabilityRecord {
    return {
      ...record,
      executionId: rawEvent.payload?.executionId || rawEvent.payload?.runId,
      sessionId: rawEvent.payload?.sessionId || rawEvent.correlation
    };
  }
}

// 4. Aggregator Interface & Implementation
export interface IAggregator {
  aggregate(record: ObservabilityRecord, rawEvent: any, registry: ObservabilityRegistry, rules: AlertRule[]): void;
}

export class TelemetryAggregator implements IAggregator {
  private alertCooldowns = new Map<string, number>();

  aggregate(record: ObservabilityRecord, rawEvent: any, registry: ObservabilityRegistry, rules: AlertRule[]): void {
    const payload = rawEvent.payload || {};

    // A. Log aggregation
    if (rawEvent.type === 'RuntimeLog' || payload.message || payload.log) {
      const logRecord: LogRecord = {
        ...record,
        message: payload.message || payload.log || JSON.stringify(payload)
      };
      registry.addLog(logRecord);
    }

    // B. Trace / Execution aggregation
    if (payload.traceId || payload.executionId || record.executionId) {
      const traceId = payload.traceId || record.executionId || 'trace-default';
      const duration = payload.duration || 0;
      const status = payload.overallStatus === 'FAIL' || record.severity === 'ERROR' ? 'failed' : 
                     payload.overallStatus === 'PASS' || rawEvent.type.includes('Ready') || rawEvent.type.includes('Stopped') ? 'success' : 'running';

      const traceRecord: TraceRecord = {
        ...record,
        traceId,
        ledgerId: payload.ledgerId || payload.runId,
        duration,
        status
      };
      registry.addTrace(traceRecord);
    }

    // C. Alert Check & Cooldown enforcement
    for (const rule of rules) {
      if (rule.enabled && rule.condition(record)) {
        const cooldownKey = `${rule.ruleId}-${record.runtimeId}`;
        const lastFired = this.alertCooldowns.get(cooldownKey) || 0;
        const now = Date.now();

        if (now - lastFired > rule.cooldown) {
          this.alertCooldowns.set(cooldownKey, now);

          const alertRecord: AlertRecord = {
            ...record,
            alertId: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ruleId: rule.ruleId,
            message: `Alert rule [${rule.ruleId}] triggered with severity [${rule.severity}] on runtime [${record.runtimeId}]`
          };
          registry.addAlert(alertRecord);
        }
      }
    }

    // D. Metrics Update
    this.refreshMetrics(registry);
  }

  private refreshMetrics(registry: ObservabilityRegistry): void {
    const logs = registry.getLogs();
    const traces = registry.getTraces();
    const alerts = registry.getAlerts();

    const runtimeStates: Record<string, RuntimeState> = {};
    const runtimeHealths: Record<string, RuntimeHealthStatus> = {};

    let validationCount = 0;
    let pluginCount = 0;
    let errorCount = logs.filter(l => l.severity === 'ERROR').length;
    let warningCount = logs.filter(l => l.severity === 'WARNING').length;

    // Collect states and healths from traces and alerts
    traces.forEach(t => {
      if (t.runtimeId) {
        runtimeStates[t.runtimeId] = RuntimeState.RUNNING;
        runtimeHealths[t.runtimeId] = t.status === 'failed' ? RuntimeHealthStatus.FAILED : RuntimeHealthStatus.HEALTHY;
        if (t.runtimeId === 'aios.validation') validationCount++;
        if (t.runtimeId === 'aios.plugin') pluginCount++;
      }
    });

    alerts.forEach(a => {
      if (a.runtimeId) {
        if (runtimeHealths[a.runtimeId] !== RuntimeHealthStatus.FAILED && runtimeHealths[a.runtimeId] !== RuntimeHealthStatus.UNHEALTHY) {
          runtimeHealths[a.runtimeId] = RuntimeHealthStatus.DEGRADED;
        }
      }
    });

    // Derive overall PlatformHealth
    let overallHealth = PlatformHealthStatus.HEALTHY;
    const healthVals = Object.values(runtimeHealths);
    if (healthVals.includes(RuntimeHealthStatus.FAILED) || healthVals.includes(RuntimeHealthStatus.UNHEALTHY)) {
      overallHealth = PlatformHealthStatus.UNHEALTHY;
    } else if (healthVals.includes(RuntimeHealthStatus.DEGRADED) || healthVals.includes(RuntimeHealthStatus.WARNING)) {
      overallHealth = PlatformHealthStatus.DEGRADED;
    }
    registry.updatePlatformHealth(overallHealth);

    const metricsRecord: MetricsRecord = {
      recordId: `METRIC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      runtimeId: 'aios.observability',
      source: 'aios.observability',
      category: 'MetricsUpdate',
      severity: 'INFO',
      metrics: {
        runtimeCount: Object.keys(runtimeStates).length,
        runtimeStates,
        runtimeHealths,
        eventThroughput: logs.length + traces.length,
        eventQueue: 0,
        validationCount,
        pluginCount,
        errorCount,
        warningCount
      }
    };
    registry.updateMetrics(metricsRecord);
  }
}

// 5. Projection Engine Interface & Implementation
export interface IProjectionEngine {
  project(registry: ObservabilityRegistry): any;
}

export class ObservabilityProjectionEngine implements IProjectionEngine {
  project(registry: ObservabilityRegistry): any {
    const rawProjection = {
      platformHealth: registry.getPlatformHealth(),
      metrics: registry.getMetrics() ? { ...registry.getMetrics()!.metrics } : null,
      activeAlerts: registry.getAlerts().map(a => ({ ...a })),
      traces: registry.getTraces().map(t => ({ ...t })),
      logs: registry.getLogs().slice(-50).map(l => ({ ...l }))
    };
    return deepFreeze(rawProjection);
  }
}

// Telemetry Pipeline Coordinator
export class TelemetryPipeline {
  private readonly collector = new TelemetryCollector();
  private readonly normalizer = new TelemetryNormalizer();
  private readonly enricher = new TelemetryEnricher();
  private readonly aggregator = new TelemetryAggregator();
  private readonly projectionEngine = new ObservabilityProjectionEngine();

  constructor(
    private readonly registry: ObservabilityRegistry,
    private readonly alertRules: AlertRule[]
  ) {}

  public processEvent(event: AIOSEvent): void {
    const raw = this.collector.collect(event);
    const normalized = this.normalizer.normalize(raw);
    const enriched = this.enricher.enrich(normalized, raw);
    this.aggregator.aggregate(enriched, raw, this.registry, this.alertRules);
  }

  public generateProjection(): any {
    return this.projectionEngine.project(this.registry);
  }
}
