/**
 * WorkflowEventPublisher.ts
 * 
 * Event Publisher & Event Bus for Workflow events
 */

import { WorkflowEvent } from './types/WorkflowEvent';
import { WorkflowEventType } from './types/WorkflowEventType';

export type WorkflowEventListener = (event: WorkflowEvent) => void | Promise<void>;

export class WorkflowEventPublisher {
  private static listeners: Set<WorkflowEventListener> = new Set();
  private static history: WorkflowEvent[] = [];

  public static subscribe(listener: WorkflowEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static publish<T = any>(
    type: WorkflowEventType,
    instanceId: string,
    taskId: string,
    payload: T,
    stageId?: string
  ): WorkflowEvent<T> {
    const event: WorkflowEvent<T> = {
      eventId: `evt-wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      instanceId,
      taskId,
      stageId,
      payload,
      timestamp: new Date().toISOString()
    };

    this.history.push(event);

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[WorkflowEventPublisher] Listener error:', err);
      }
    });

    return event;
  }

  public static getHistory(): WorkflowEvent[] {
    return [...this.history];
  }

  public static clear(): void {
    this.listeners.clear();
    this.history = [];
  }
}
