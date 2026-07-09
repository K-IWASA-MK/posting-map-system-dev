# Execution Dispatcher Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution Dispatcher Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution Dispatcher** represents the static dispatcher structure within the Execution Layer. It serves as a Single Source of Truth (SSOT) to classify dispatch strategies, metadata logs, and bound execution context IDs.

At this foundation phase:
* **No Runtime Action**: The Execution Dispatcher is **NOT** responsible for invoking execution processes, performing real-time routing, active queue handling, retry loops, or scheduling tasks. It acts strictly as a static configuration blueprint representing **where the request is dispatched to** and **which dispatch strategy is adopted**.
* **Complete Immutability (Multi-Layer Object.freeze)**: All elements, including metadata logs, context blocks, dispatcher descriptions, and the blueprint container itself, are strictly frozen at creation time.
* **Perfect Determinism**: Does not use clock timestamps, uuid generators, or dynamic lookups.
* **Separation of Concerns**: Schedulers, matching algorithms, queue engines, routers, and execution executors are decoupled in separate layers and phases.

---

## 2. Data Models & Schemas

### 2.1 DispatcherType
The category/type of the execution dispatcher.

```typescript
export enum DispatcherType {
  FOUNDATION = 'FOUNDATION', // The core blueprint dispatcher (current phase)
  RUNTIME    = 'RUNTIME',    // Active agent dispatcher (future)
  SIMULATION = 'SIMULATION', // Sandbox execution dispatcher (future)
  PLUGIN     = 'PLUGIN',     // Third-party dispatcher (future)
  AI         = 'AI'          // Adaptive AI dispatcher (future)
}
```

### 2.2 DispatcherStrategy
Static classification of dispatch methods.

> [!IMPORTANT]
> **Boundary Rule**: `DispatcherStrategy` is a static category classification (STATIC, DIRECT, PIPELINE, ROUTER) defining the dispatch method setup. It **MUST NOT** perform active runtime dispatching, queue processing, or routing.

```typescript
export enum DispatcherStrategy {
  STATIC   = 'STATIC',
  DIRECT   = 'DIRECT',
  PIPELINE = 'PIPELINE',
  ROUTER   = 'ROUTER'
}
```

### 2.3 DispatcherMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface DispatcherMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.4 ExecutionDispatcherContext
Stores references/IDs to related execution entities.

> [!IMPORTANT]
> **Boundary Rule**: `ExecutionDispatcherContext` stores only identifier strings (IDs) of other static execution blocks (`executionEngineId`, `executionRegistryId`, `executionRequestId`, `executionResultId`, `executionStateId`, `executionResolverId`) to ensure loose coupling and maintain a strict Single Source of Truth (SSOT). It does **NOT** hold references to the objects themselves, nor does it perform resolution or instantiation.

```typescript
export interface ExecutionDispatcherContext {
  readonly executionEngineId: string;         // Target Execution Engine ID
  readonly executionRegistryId: string;       // Target Execution Registry ID
  readonly executionRequestId: string;        // Target Execution Request ID
  readonly executionResultId: string;         // Target Execution Result ID
  readonly executionStateId: string;          // Target Execution State ID
  readonly executionResolverId: string;       // Target Execution Resolver ID
}
```

### 2.5 ExecutionDispatcher
The execution dispatcher model.

```typescript
export interface ExecutionDispatcher {
  readonly id: string;                        // Unique dispatcher ID (e.g. execution-dispatcher-01)
  readonly name: string;                      // Dispatcher name
  readonly description: string;               // Purpose/description
  readonly dispatcherType: DispatcherType;    // Dispatcher type
  readonly strategy: DispatcherStrategy;      // Dispatcher static strategy category
  readonly context: ExecutionDispatcherContext; // Bound static execution context IDs
  readonly metadata: DispatcherMetadata;      // Entry metadata block
}
```

---

## 3. ExecutionDispatcherBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution dispatcher descriptor. It exposes pure getter interfaces to request dispatcher specs safely.

```typescript
export interface ExecutionDispatcherBlueprint {
  getDispatcher(): ExecutionDispatcher;
  getContext(): ExecutionDispatcherContext;
  getMetadata(): DispatcherMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution Dispatcher resolves statically at the bottom of the DevelopmentRules static hierarchy:

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
```

`DevelopmentRules.getExecutionDispatcher(rule)` evaluates the static resolution chain directly and returns the singleton request definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `dispatch()`, `route()`, `schedule()`, `invoke()`, `execute()`, `enqueue()`, `retry()` must NOT exist in the blueprint container or static model.
* **Multi-Layer Immutability Guarantee**:
  - Individual Metadata: `Object.freeze(metadata)`
  - Individual Context: `Object.freeze(context)`
  - Dispatcher Model: `Object.freeze(dispatcher)`
  - Blueprint Container: `Object.freeze(EXECUTION_DISPATCHER_BLUEPRINT)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the dispatcher blueprint must return the exact same frozen reference.
