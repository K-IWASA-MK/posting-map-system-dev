import { RuntimeEventBus } from "../../orchestration/events/RuntimeEventBus";
import { AutonomousEvent, AutonomousEventType, toRuntimeEvent } from "../contracts/AutonomousTriggerContract";

export class AutonomousExecutionTrace {
  private readonly eventBus: RuntimeEventBus;
  private readonly traceLogs: AutonomousEvent[] = [];

  constructor(eventBus: RuntimeEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Safe event emission matching the AIOS integration event contract.
   */
  public async emit(
    eventType: AutonomousEventType,
    correlationId: string,
    payload: Record<string, any>
  ): Promise<AutonomousEvent> {
    const event: AutonomousEvent = {
      eventId: `EV-AUT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      eventType,
      sourceRuntime: "AutonomousRuntime",
      timestamp: Date.now(),
      payload,
      schemaVersion: "v1",
      correlationId
    };

    // Store in internal read-only log
    this.traceLogs.push(event);

    // Publish to orchestration bus so audit and observability can collect it
    const runtimeEvent = toRuntimeEvent(event);
    await this.eventBus.publish(runtimeEvent);

    return event;
  }

  public getTraceLogs(): readonly AutonomousEvent[] {
    return this.traceLogs;
  }

  public clear(): void {
    this.traceLogs.length = 0;
  }
}
