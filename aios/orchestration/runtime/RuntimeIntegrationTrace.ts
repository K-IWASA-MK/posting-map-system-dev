export interface OrchestrationTrace {
  readonly traceId: string;
  readonly eventId: string;
  readonly source: string;
  readonly target: string;
  readonly status: "DELIVERED" | "EVENT_FAILED" | "CONTRACT_INVALID" | "BLOCKED_BY_POLICY";
  readonly timestamp: number;
  readonly error?: string;
}

export class RuntimeIntegrationTrace {
  private readonly traces: OrchestrationTrace[] = [];

  /**
   * Records a new event routing trace.
   */
  public record(trace: OrchestrationTrace): void {
    this.traces.push(Object.freeze(trace));
  }

  /**
   * Resolves the entire record log.
   */
  public getTraces(): readonly OrchestrationTrace[] {
    return this.traces;
  }

  /**
   * Resolves traces filtering by the event ID.
   */
  public getTracesByEvent(eventId: string): readonly OrchestrationTrace[] {
    return this.traces.filter(t => t.eventId === eventId);
  }

  /**
   * Clears the current record log cache.
   */
  public clear(): void {
    this.traces.length = 0;
  }
}
