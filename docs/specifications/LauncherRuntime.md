# Launcher Execution Runtime Specification

## Purpose

Launcher Execution Runtime is the process execution plane of the AIOS Platform. Acting as the sibling layer to Launcher Foundation, it converts a successful launch verification gate result (`LauncherResult(decision === 'allow')`) into an active executing process context, while completely hiding platform native execution complexities.

---

## Execution Constitution

The Launcher Execution Runtime strictly adheres to the following core architectural rules:

> 1. **Launcher validates only**: Policy decisions, state evaluations, and file checks reside strictly inside the Launcher Foundation (G6-11).
> 2. **Launcher Execution Runtime executes only**: The runtime is dedicated to process lifecycle, spawning, stream forwarding, and process signaling.
> 3. **Execution Runtime never evaluates policy**: It acts on trust and delegates all rules to Launcher results. If the incoming decision is not `allow`, it refuses to boot and throws `InvalidLauncherDecisionError`.
> 4. **Execution Runtime never reads registry.json**: It is decoupled from the Project Registry database.
> 5. **Execution Runtime never accesses ProjectManager**: It relies on Project ID context passed in requirements and does not look up Project Manager stores.

---

## Process Abstraction Layer

Execution is model-separated to facilitate scaling and isolation:

* **`IExecutionProcess`**: The core abstract contract. Holds metadata (`projectId`, `processId`, `pid`), stream wrappers (`stdout`, `stderr`), and signaling endpoints (`kill`, `onExit`).
* **`NodeExecutionProcess`**: The Node.js implementation wrapper. Wraps native `child_process.ChildProcess` instances.
* **Future Implementations**: Can easily support `DockerExecutionProcess`, `RemoteExecutionProcess`, or `SandboxExecutionProcess` without breaking client code.

---

## Runtime Store Registry

`LauncherRuntimeRegistry` tracks active process state in memory. Following Single Responsibility principles, it is restricted to state storage only:
- Provides `register`, `remove`, `find`, `list`, and `count`.
- Does not trigger actions (no spawning, no killing, no stream listening). All operations are triggered by coordinating managers or sessions.

---

## Session Execution Flowchart

```
[Validated LauncherResult (allow)]
               │
               ▼
   [LauncherExecutionRuntime] ──(Spawns process)──> [NodeExecutionProcess]
               │                                            │
               ▼                                            ▼
     (Returns IExecutionProcess)                  (Emits stdout/stderr/exit)
               │
               ▼
    [LauncherRuntimeRegistry] ──(Registers processId)
```
