# Execution Session Specification

## Purpose

Execution Session provides the tracking, lifecycle, and telemetry layer for running project processes in the AIOS Platform. Acting on top of the Execution Runtime layer, it wraps raw execution processes with state management, compiles log telemetry, handles exit propagation, and outputs static snapshots for ledger recording.

---

## Session Constitution

The Execution Session plane strictly adheres to the following core constraints:

> 1. **Execution Session owns lifecycle only**: It is dedicated to tracking session status and telemetry.
> 2. **Execution Session never evaluates policy**: It acts on trust and does not review validation rules.
> 3. **Execution Session never spawns processes**: Spawning processes is strictly delegated to the `LauncherExecutionRuntime` plane (G6-12).
> 4. **Execution Session never stores historical records**: It manages active running state; persistent audit logging is delegated to the Execution Ledger.
> 5. **Execution Session exposes immutable runtime snapshots only**: It does not expose mutable runtime internals. Static snapshots are compiled via `ExecutionResultFactory`.

---

## Session Status State Machine

The session status transitions strictly as follows:

```
    [created] ──(Session.start())──> [active]
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
       (Exit Code 0)            (Exit Code != 0)          (Session.stop())
             │                          │                          │
             ▼                          ▼                          ▼
        [completed]                  [failed]                 [terminated]
```

---

## Extensible Telemetry Metrics

`SessionMetrics` compiles runtime indicators during session activity:
- `stdoutLines`: Incremental lines read from the process standard output stream.
- `stderrLines`: Incremental lines read from the process standard error stream.
- `cpuTimeMs` (Reserved): Accumulated hardware CPU execution time.
- `memoryPeakBytes` (Reserved): Peak memory usage in bytes.
- `bytesRead` / `bytesWritten` (Reserved): Disk / Socket interface traffic telemetry.

---

## Manager Boundaries

The `ExecutionSessionManager` coordinates sessions under the following strict limits:
* **Allowed Responsibilities**: Create Session, Register, Find, Terminate, and List Active Sessions.
* **Prohibited Actions**: Spawning processes (`spawn`), policy check (`policy`), structure validation (`validation`), stream piping / logging (`logging`), metrics calculation (`metrics calculation`). These are strictly handled by their respective layers.
* **Registry Decoupling**: It must never instantiate registries directly. The `LauncherRuntimeRegistry` is received via dependency injection (DI).
