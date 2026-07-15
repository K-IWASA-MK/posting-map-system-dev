# Runtime Scheduler Specification

## Purpose

Runtime Scheduler regulates session concurrency and manages prioritized execution queues across the AIOS runtime space. It ensures that when execution demands exceed maximum compute thresholds (concurrency limits), incoming sessions are safely queued and dispatched reactively based on priority weights.

---

## Runtime Scheduler Constitution

The Runtime Scheduler plane strictly adheres to the following core constraints:

> 1. **Runtime Scheduler schedules tasks only**: It oversees queueing and dispatching order and is decoupled from process launching logic.
> 2. **Runtime Scheduler never evaluates trust**: Authentication and permission checks are completed by the Trust Runtime plane (G6-18) before scheduling.
> 3. **Runtime Scheduler never prepares workspaces**: Workspace locks and file system allocations are delegated to the Workspace Runtime plane (G6-14).
> 4. **Runtime Scheduler never publishes runtime events**: It does not emit event packages back to the Event Bus.
> 5. **Runtime Scheduler depends only on immutable task definitions**: Queued task parameters (`SchedulerTask`) remain constant throughout their lifespan in the queue.

---

## Queue Management Architecture

The scheduler is structured into isolated, testable modules:

```
[Incoming Task Request] ──> [Scheduler.schedule()]
                                   │
                     ┌─────────────┴─────────────┐
        (under concurrency limit)    (over concurrency limit)
                     │                           │
                     ▼                           ▼
            [SessionDispatcher]          [SchedulerQueue] ──> sorted via [ISchedulerOrderingStrategy]
                     │                           │
            (allocates session)                  ├──> (Event Bus signals 'SESSION_COMPLETED')
                     │                           │
                     ▼                           ▼
            [Active Session]             [SchedulerQueue.dequeue()] ──> [SessionDispatcher]
```

- **`ISchedulerOrderingStrategy`**: Compares two tasks for positioning in the queue. Default implementation `PriorityOrderingStrategy` orders by:
  1. Priority descending (`high` (3) > `normal` (2) > `low` (1)).
  2. FIFO (First-In, First-Out) timestamp order if priority matches.
- **`RuntimeSchedulerEventHandler`**: Listens specifically for session completion/failure signals (`SESSION_COMPLETED`, `SESSION_FAILED`, `SESSION_TERMINATED`) to decrement concurrency counts and trigger the next dispatch.
- **`SchedulerPolicy`**: Controls limits:
  - `MAX_QUEUE_SIZE`: 100.
  - `DEFAULT_CONCURRENCY`: 2.

---

## Error Handling

- **`SCHEDULER_QUEUE_FULL`**: Raised if a task is scheduled when the number of items in the queue already equals `MAX_QUEUE_SIZE`.
