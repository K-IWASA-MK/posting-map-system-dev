# Runtime Event Bus Specification

## Purpose

Runtime Event Bus acts as the central asynchronous communication hub for AIOS Platform execution events. It transmits lifecycle transitions (such as process launches, workspace lockdowns, error limits, and sandbox authorization violations) from system planes to observation modules (e.g. Monitoring, Ledger, Auditing) without binding them to concrete module code.

---

## Event Bus Constitution

The Runtime Event Bus module strictly adheres to the following core constraints:

> 1. **Runtime Event Bus propagates events only**: It coordinates transmission paths and is unaware of payload logic.
> 2. **Runtime Event Bus never logs events**: Event recording is delegated to the Monitoring / Logger planes.
> 3. **Runtime Event Bus never stores events**: It operates on active in-memory routing; past audit persistence is delegated to the Ledger.
> 4. **Runtime Event Bus never retries handlers**: Subscriber callbacks are run exactly once. If a subscriber fails, no retry strategy is executed.
> 5. **Runtime Event Bus isolates subscriber failures**: Errors thrown inside subscriber callbacks are caught internally to avoid blocking the bus publisher or other handlers.

---

## Subscriber Isolation

Subscribers are executed inside isolated sandboxed loops. When an event is published:
- If Subscriber A throws an exception, it is caught internally and a console warning is emitted.
- Subscriber B continues to execute normally.
- The `publish` caller receives a success response without being exposed to Subscriber A's internal crash.

---

## Asynchronous vs. Synchronous Execution

To prevent scheduling loops, event publishing is kept synchronous and direct:
* `publish()` immediately executes subscribers during the same event-loop ticks.
* No internal `Promise` chains or `setImmediate` deferments are introduced within the Event Bus plane.

---

## Execution Interface Layout

- **`RuntimeEvent<TPayload>`**: Generic event envelope. Carries `timestamp`, `eventId`, `source`, `type`, and trace parameters (`requestId`, `sessionId`, `projectId`, `pluginId`).
- **`IEventIdProvider`**: Abstracts unique event identifier compilation.
- **`Subscription`**: Unbind interface supplying `unsubscribe()`.
- **`RuntimeEventBus`**: Synchronous routing engine with subscriber isolation guards.
