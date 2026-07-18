import { DashboardDataAuditEvent } from "./DashboardDataAuditEvent";

export type AuditEventListener = (event: DashboardDataAuditEvent) => void;

export class DashboardAuditPublisher {
  private static listeners = new Set<AuditEventListener>();

  /**
   * Publishes an audit event to all registered listeners.
   * Execution is fully wrapped in a try/catch block to avoid throwing and blocking the caller runtime.
   */
  public static publish(event: DashboardDataAuditEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err: any) {
        console.warn(`[DashboardAuditPublisher] Isolated warning: Audit listener failed: ${err.message}`);
      }
    }
  }

  /**
   * Subscribes a listener to dashboard data audit events.
   * Returns an unsubscribe function.
   */
  public static subscribe(listener: AuditEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Clears all subscribers (primarily for testing purposes).
   */
  public static clear(): void {
    this.listeners.clear();
  }
}
