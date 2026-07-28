/**
 * ProjectEventPublisher.ts
 * 
 * Event Publisher for Project Events
 */

import { ProjectEvent } from './types/ProjectEvent';
import { ProjectEventType } from './types/ProjectEventType';

export type ProjectEventListener = (event: ProjectEvent) => void | Promise<void>;

export class ProjectEventPublisher {
  private static listeners: Set<ProjectEventListener> = new Set();
  private static history: ProjectEvent[] = [];

  public static subscribe(listener: ProjectEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static publish<T = any>(
    type: ProjectEventType,
    projectId: string,
    taskId?: string,
    payload?: T
  ): ProjectEvent<T> {
    const event: ProjectEvent<T> = {
      eventId: `evt-proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      projectId,
      taskId,
      payload: payload || ({} as T),
      timestamp: new Date().toISOString()
    };

    this.history.push(event);

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[ProjectEventPublisher] Listener error:', err);
      }
    });

    return event;
  }

  public static getHistory(): ProjectEvent[] {
    return [...this.history];
  }

  public static clear(): void {
    this.listeners.clear();
    this.history = [];
  }
}
