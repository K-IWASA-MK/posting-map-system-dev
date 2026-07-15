import { IRuntimeScheduler } from './IRuntimeScheduler';
import { SchedulerTask } from './SchedulerTask';
import { SchedulerState } from './SchedulerState';
import { SchedulerMetrics } from './SchedulerMetrics';
import { SchedulerQueue } from './SchedulerQueue';
import { ISessionDispatcher } from './ISessionDispatcher';
import { RuntimeSchedulerEventHandler } from './RuntimeSchedulerEventHandler';
import { IRuntimeEventBus } from '../runtime-event-bus/IRuntimeEventBus';
import { SchedulerPolicy } from './SchedulerPolicy';
import { SchedulerError } from './RuntimeSchedulerErrors';

/**
 * RuntimeScheduler coordinates scheduling of tasks, respect concurrency limits and sorting strategies.
 * Conforms to: schedules tasks only, never publishes events, depends on immutable configurations.
 */
export class RuntimeScheduler implements IRuntimeScheduler {
  private readonly queue: SchedulerQueue;
  private readonly dispatcher: ISessionDispatcher;
  private readonly eventHandler: RuntimeSchedulerEventHandler;
  private readonly maxConcurrency: number;

  private state: SchedulerState = 'created';
  private activeDispatches = 0;
  private totalQueued = 0;
  private totalDispatched = 0;

  constructor(
    queue: SchedulerQueue,
    dispatcher: ISessionDispatcher,
    eventBus: IRuntimeEventBus,
    maxConcurrency = SchedulerPolicy.DEFAULT_CONCURRENCY
  ) {
    this.queue = queue;
    this.dispatcher = dispatcher;
    this.maxConcurrency = maxConcurrency;
    this.state = 'running';

    // Hook slot releases via event handler
    this.eventHandler = new RuntimeSchedulerEventHandler(eventBus, () => {
      this.handleSlotReleased();
    });
  }

  /**
   * Schedules a task to be processed immediately or placed in the queue.
   */
  public schedule(task: SchedulerTask): void {
    if (this.state === 'stopped') {
      throw new Error('Scheduler has stopped');
    }

    if (this.queue.size() >= SchedulerPolicy.MAX_QUEUE_SIZE) {
      throw new SchedulerError('SCHEDULER_QUEUE_FULL', 'Max scheduler queue size reached.');
    }

    this.totalQueued++;

    if (this.activeDispatches < this.maxConcurrency) {
      this.dispatchTask(task);
    } else {
      this.queue.enqueue(task);
    }
  }

  public getState(): SchedulerState {
    return this.state;
  }

  public getMetrics(): SchedulerMetrics {
    return {
      queueLength: this.queue.size(),
      activeDispatches: this.activeDispatches,
      totalQueued: this.totalQueued,
      totalDispatched: this.totalDispatched
    };
  }

  /**
   * Stops scheduling and unhooks listeners.
   */
  public stop(): void {
    this.state = 'stopped';
    this.eventHandler.stop();
    this.queue.clear();
  }

  private handleSlotReleased(): void {
    if (this.state !== 'running') {
      return;
    }

    if (this.activeDispatches > 0) {
      this.activeDispatches--;
    }

    this.processNext();
  }

  private processNext(): void {
    if (this.activeDispatches >= this.maxConcurrency) {
      return;
    }

    const nextTask = this.queue.dequeue();
    if (nextTask) {
      this.dispatchTask(nextTask);
    }
  }

  private dispatchTask(task: SchedulerTask): void {
    this.activeDispatches++;
    this.totalDispatched++;

    this.dispatcher.dispatch(task).catch((err) => {
      console.warn('[RuntimeScheduler] Task dispatch failed:', err);
    });
  }
}
