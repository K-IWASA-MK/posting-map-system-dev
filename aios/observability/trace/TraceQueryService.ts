import { ObservabilityEvent } from "../contracts/ObservabilityEventContract";

export class TraceQueryService {
  private readonly events: ObservabilityEvent[] = [];

  /**
   * Append an event to the trace store.
   */
  public record(event: ObservabilityEvent): void {
    this.events.push(Object.freeze(event));
  }

  /**
   * Filters and returns traces matching search constraints.
   */
  public query(filters?: {
    readonly traceId?: string;
    readonly runtime?: string;
    readonly status?: string;
  }): readonly ObservabilityEvent[] {
    if (!filters) {
      return this.events;
    }
    return this.events.filter(e => {
      if (filters.traceId && e.traceId !== filters.traceId) {
        return false;
      }
      if (filters.runtime && e.runtime !== filters.runtime) {
        return false;
      }
      if (filters.status && e.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  /**
   * Clears internal trace store caches.
   */
  public clear(): void {
    this.events.length = 0;
  }
}
