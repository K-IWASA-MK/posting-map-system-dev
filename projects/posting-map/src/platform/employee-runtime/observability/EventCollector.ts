/**
 * AIOS Employee Observability Foundation
 * Event Collector Implementation
 */

import { IEventCollector } from './contract/IEmployeeObservability';
import { ObservationRecord, RuntimeEvent } from './models/EmployeeObservabilityModels';

export class EventCollector implements IEventCollector {
  private events: RuntimeEvent[] = [];
  private observations: ObservationRecord[] = [];

  public collectEvent(event: RuntimeEvent): ObservationRecord {
    // 1. Freeze event payload to prevent alteration
    const frozenEvent: RuntimeEvent = Object.freeze({
      ...event,
      payload: Object.freeze({ ...event.payload }),
    });

    this.events.push(frozenEvent);

    const observationId = `OBS-${event.eventId}-${Date.now()}`;
    const observation: ObservationRecord = Object.freeze({
      observationId: observationId,
      employeeId: event.payload.employeeId || 'UNKNOWN',
      taskId: event.payload.taskId || 'UNKNOWN',
      executionId: event.payload.executionId || 'UNKNOWN',
      resultId: event.payload.resultId || 'UNKNOWN',
      eventType: event.eventType,
      timestamp: event.timestamp,
    });

    this.observations.push(observation);
    return observation;
  }

  public getEvents(eventType?: string): RuntimeEvent[] {
    if (eventType) {
      return this.events.filter((e) => e.eventType === eventType);
    }
    return [...this.events];
  }

  public getObservations(): ObservationRecord[] {
    return [...this.observations];
  }
}
