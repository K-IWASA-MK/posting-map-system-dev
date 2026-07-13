# Execution Runtime Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution Runtime Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution Runtime** represents the boundary layer connecting the Blueprint and the Runtime execution within the Execution Layer. It serves as a Single Source of Truth (SSOT) to define the runtime configuration, execution context IDs, and metadata logs.

At this foundation phase:
* **No Runtime Action**: The Execution Runtime is **NOT** responsible for invoking execution processes, performing real-time transitions, hydration, validation, dispatching, queueing, retrying, scheduling tasks, or managing active state loops. It acts strictly as a static structural blueprint representing **the runtime configuration**.
* **Complete Immutability (Multi-Layer Object.freeze)**: All elements, including metadata logs, context blocks, runtime configuration, and the blueprint container itself, are strictly frozen at creation time.
* **Perfect Determinism**: Does not use clock timestamps, uuid generators, or dynamic lookups.
* **Separation of Concerns**: Executors, state machines, schedulers, active queue engines, and run loop controllers are decoupled in separate layers and phases.

---

## 2. Data Models & Schemas

### 2.1 RuntimeType
The category/type of the execution runtime.

```typescript
export enum RuntimeType {
  FOUNDATION = 'FOUNDATION', // The core blueprint runtime (current phase)
  RUNTIME    = 'RUNTIME',    // Active execution runtime (future)
  SIMULATION = 'SIMULATION', // Sandbox execution runtime (future)
  PLUGIN     = 'PLUGIN',     // Plugin execution runtime (future)
  AI         = 'AI'          // Adaptive AI runtime (future)
}
```

### 2.2 RuntimeMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface RuntimeMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.3 ExecutionRuntimeContext
Stores references/IDs to related execution entities.

> [!IMPORTANT]
> **Boundary Rule**: `ExecutionRuntimeContext` stores only identifier strings (IDs) of other static execution blocks (`executionEngineId`, `executionRegistryId`, `executionRequestId`, `executionResultId`, `executionStateId`, `executionResolverId`, `executionDispatcherId`) to ensure loose coupling and maintain a strict Single Source of Truth (SSOT). It does **NOT** hold references to the objects themselves, nor does it perform resolution or instantiation.

```typescript
export interface ExecutionRuntimeContext {
  readonly executionEngineId: string;         // Target Execution Engine ID
  readonly executionRegistryId: string;       // Target Execution Registry ID
  readonly executionRequestId: string;        // Target Execution Request ID
  readonly executionResultId: string;         // Target Execution Result ID
  readonly executionStateId: string;          // Target Execution State ID
  readonly executionResolverId: string;       // Target Execution Resolver ID
  readonly executionDispatcherId: string;     // Target Execution Dispatcher ID
}
```

### 2.4 ExecutionRuntime
The execution runtime model.

```typescript
export interface ExecutionRuntime {
  readonly id: string;                        // Unique runtime ID (e.g. execution-runtime-01)
  readonly name: string;                      // Runtime name
  readonly description: string;               // Purpose/description
  readonly runtimeType: RuntimeType;          // Runtime type
  readonly context: ExecutionRuntimeContext;   // Bound static execution context IDs
  readonly metadata: RuntimeMetadata;         // Entry metadata block
}
```

---

## 3. ExecutionRuntimeBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution runtime descriptor. It exposes pure getter interfaces to request runtime specs safely.

```typescript
export interface ExecutionRuntimeBlueprint {
  getRuntime(): ExecutionRuntime;
  getContext(): ExecutionRuntimeContext;
  getMetadata(): RuntimeMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution Runtime resolves statically at the bottom of the DevelopmentRules static hierarchy:

```
DevelopmentRule
      ↓
Capability
      ↓
Pipeline
      ↓
Runtime
      ↓
RuntimeSession
      ↓
RuntimeContext
      ↓
RuntimeQueue
      ↓
RuntimeTask
      ↓
RuntimeExecutionPlan
      ↓
RuntimeExecutionGraph
      ↓
ExecutionEngine
      ↓
ExecutionRegistry
      ↓
ExecutionRequest
      ↓
ExecutionResult
      ↓
ExecutionState
      ↓
ExecutionResolver
      ↓
ExecutionDispatcher
      ↓
ExecutionRuntime
```

`DevelopmentRules.getExecutionRuntime(rule)` evaluates the static resolution chain directly and returns the singleton runtime definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `execute()`, `dispatch()`, `transition()`, `hydrate()`, `validate()`, `schedule()`, `queue()`, `retry()`, `invoke()` must NOT exist in the blueprint container or static model.
* **Multi-Layer Immutability Guarantee**:
  - Individual Metadata: `Object.freeze(metadata)`
  - Individual Context: `Object.freeze(context)`
  - Runtime Model: `Object.freeze(runtime)`
  - Blueprint Container: `Object.freeze(EXECUTION_RUNTIME_BLUEPRINT)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the runtime blueprint must return the exact same frozen reference.
