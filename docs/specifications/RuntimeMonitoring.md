# Runtime Monitoring Specification

## Purpose

Runtime Monitoring compiles real-time telemetry metrics (such as active execution threads, failed launches, sandbox violations, and locking collisons) from the AIOS execution plane. It operates strictly as an event-driven subscriber that decouples status logging from actual execution runtimes.

---

## Runtime Monitoring Constitution

The Runtime Monitoring plane strictly adheres to the following core constraints:

> 1. **Runtime Monitoring observes only**: It handles unidirectional event ingestion and never mutates system states.
> 2. **Runtime Monitoring aggregates only**: It performs local in-memory count summarization and is decoupled from database logging.
> 3. **Runtime Monitoring never mutates runtime state**: It holds zero execution authority and never prepares sandboxes or writes locks.
> 4. **Runtime Monitoring never controls sessions**: It does not spin up or terminate processes or session structures.
> 5. **Runtime Monitoring never publishes events**: It subscribes to the Event Bus and never publishes events back into the bus.

---

## Architecture Layout

The monitoring plane is decoupled into the following components to ensure high maintainability:

* **`RuntimeMonitoringCounters`**: Holds mutable metrics in memory.
* **`RuntimeMonitoringSnapshotFactory`**: Converts active counters into immutable snapshots, calculating uptime and adding timestamps.
* **`RuntimeMonitoringEventHandler`**: Routes incoming event streams to target counter mutations using a `Map` structure mapping event types to handlers.
* **`RuntimeMonitoringService`**: Direct Event Bus subscriber that exposes snapshot compiling and test resets.

---

## Monitored Events and Counter Calculations

The following event transitions map directly to metrics adjustments:

| Incoming Event Type | Metric Counter Updates |
|---|---|
| `LAUNCH_REQUESTED` | `totalLaunches` (Increment) |
| `SESSION_ACTIVE` | `activeSessionsCount` (Increment) |
| `SESSION_COMPLETED` | `activeSessionsCount` (Decrement), `totalCompleted` (Increment) |
| `SESSION_FAILED` | `activeSessionsCount` (Decrement), `totalFailed` (Increment) |
| `SESSION_TERMINATED` | `activeSessionsCount` (Decrement), `totalFailed` (Increment) |
| `WORKSPACE_PREPARED` | `totalWorkspacePrepared` (Increment) |
| `WORKSPACE_LOCKED` | `workspaceLocksBlocked` (Increment) |
| `PLUGIN_EXECUTED` | `totalPluginsExecuted` (Increment) |
| `PLUGIN_PERMISSION_DENIED` | `permissionDenials` (Increment) |

---

## Snapshot Trace Specifications

Snapshots are exported as `RuntimeMonitoringSnapshot` including:
- `timestamp`: Epoch millisecond timestamp of snapshot creation.
- `uptimeMs`: Milliseconds elapsed since monitoring service bootstrap.
- G7 Reserved variables (`totalPluginsExecuted`, `totalRuntimeErrors`, `totalWorkspacePrepared`).
