import { WorkspacePathAuditEvent, WorkspacePathEventType } from './WorkspacePathAuditEvent';

export class WorkspacePathAuditLogger {
  private static instance: WorkspacePathAuditLogger;
  private readonly events: WorkspacePathAuditEvent[] = [];
  private eventCounter = 0;

  private constructor() {}

  public static getInstance(): WorkspacePathAuditLogger {
    if (!WorkspacePathAuditLogger.instance) {
      WorkspacePathAuditLogger.instance = new WorkspacePathAuditLogger();
    }
    return WorkspacePathAuditLogger.instance;
  }

  public logEvent(
    params: Omit<WorkspacePathAuditEvent, 'eventId' | 'timestamp'>
  ): WorkspacePathAuditEvent {
    const event: WorkspacePathAuditEvent = {
      eventId: `wpae-${Date.now()}-${++this.eventCounter}`,
      timestamp: new Date().toISOString(),
      ...params
    };

    this.events.push(Object.freeze(event));

    // Optional integration with AIOS ExecutionLedgerRegistry if available
    try {
      const { ExecutionLedgerRegistry } = require('../../../../sdk/ExecutionLedgerRegistry');
      if (ExecutionLedgerRegistry && typeof ExecutionLedgerRegistry.register === 'function') {
        ExecutionLedgerRegistry.register({
          executionId: event.eventId,
          executionState: 'COMPLETED',
          timestamp: event.timestamp,
          capability: 'WORKSPACE_PATH_AUDIT',
          skillSequence: [event.componentName, event.eventType],
          metadata: {
            ...event
          }
        });
      }
    } catch {
      // Non-blocking fallback if ExecutionLedgerRegistry is unavailable in context
    }

    return event;
  }

  public getEvents(): readonly WorkspacePathAuditEvent[] {
    return [...this.events];
  }

  public getEventsByComponent(componentName: string): WorkspacePathAuditEvent[] {
    return this.events.filter(e => e.componentName === componentName);
  }

  public getEventsByType(eventType: WorkspacePathEventType): WorkspacePathAuditEvent[] {
    return this.events.filter(e => e.eventType === eventType);
  }

  public clear(): void {
    this.events.length = 0;
    this.eventCounter = 0;
  }
}
