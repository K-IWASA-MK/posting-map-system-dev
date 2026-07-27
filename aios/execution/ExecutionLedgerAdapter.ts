import * as crypto from 'crypto';
import { AIAssignmentContract } from '../workforce/AIAssignmentContract';
import { ExecutionEvent, ExecutionEventType } from './WorkforceExecutionTypes';

export class ExecutionLedgerAdapter {
  private readonly events: Map<string, ExecutionEvent[]> = new Map();

  /**
   * Generates a deterministic executionContextHash linking assignment, manifest, policy, and employee.
   */
  public static generateContextHash(contract: AIAssignmentContract): string {
    const raw = `${contract.assignmentId}:${contract.taskId}:${contract.employeeId}:${contract.targetProjectId}:${contract.projectManifest.version}:${contract.assignedAt}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  /**
   * Records an ExecutionEvent into the event stream for a given executionId.
   */
  public recordEvent(
    executionId: string,
    eventType: ExecutionEventType,
    payload: Record<string, unknown>
  ): ExecutionEvent {
    const event: ExecutionEvent = {
      executionId,
      eventType,
      timestamp: Date.now(),
      payload: Object.freeze(payload)
    };

    const stream = this.events.get(executionId) || [];
    stream.push(event);
    this.events.set(executionId, stream);
    return event;
  }

  /**
   * Returns all recorded ExecutionEvents for a given executionId.
   */
  public getEvents(executionId: string): readonly ExecutionEvent[] {
    return this.events.get(executionId) || [];
  }

  /**
   * Clears the current event store. Intended for test isolation.
   */
  public clear(): void {
    this.events.clear();
  }
}
