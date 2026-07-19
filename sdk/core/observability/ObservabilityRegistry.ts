import { 
  LogRecord, 
  TraceRecord, 
  AlertRecord, 
  MetricsRecord, 
  PlatformHealthStatus, 
  ObservabilityRecord 
} from './ObservabilityRecord';

export class ObservabilityRegistry {
  private logs: LogRecord[] = [];
  private traces: TraceRecord[] = [];
  private alerts: AlertRecord[] = [];
  private latestMetrics?: MetricsRecord;
  private currentPlatformHealth: PlatformHealthStatus = PlatformHealthStatus.UNKNOWN;

  private readonly logLimit: number;
  private readonly traceLimit: number;
  private readonly alertLimit: number;

  constructor(logLimit = 500, traceLimit = 500, alertLimit = 300) {
    this.logLimit = logLimit;
    this.traceLimit = traceLimit;
    this.alertLimit = alertLimit;
  }

  public addLog(record: LogRecord): void {
    this.logs.push(record);
    if (this.logs.length > this.logLimit) {
      this.logs.shift();
    }
  }

  public addTrace(record: TraceRecord): void {
    // If trace already exists (e.g. updating a running trace), update it
    const index = this.traces.findIndex(t => t.traceId === record.traceId);
    if (index !== -1) {
      this.traces[index] = record;
    } else {
      this.traces.push(record);
      if (this.traces.length > this.traceLimit) {
        this.traces.shift();
      }
    }
  }

  public addAlert(record: AlertRecord): void {
    this.alerts.push(record);
    if (this.alerts.length > this.alertLimit) {
      this.alerts.shift();
    }
  }

  public updateMetrics(record: MetricsRecord): void {
    this.latestMetrics = record;
  }

  public updatePlatformHealth(status: PlatformHealthStatus): void {
    this.currentPlatformHealth = status;
  }

  public getLogs(): readonly LogRecord[] {
    return this.logs;
  }

  public getTraces(): readonly TraceRecord[] {
    return this.traces;
  }

  public getAlerts(): readonly AlertRecord[] {
    return this.alerts;
  }

  public getMetrics(): MetricsRecord | undefined {
    return this.latestMetrics;
  }

  public getPlatformHealth(): PlatformHealthStatus {
    return this.currentPlatformHealth;
  }
}
