# Execution State Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution State Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution State** represents the static, declarative representation of an execution state classification. It serves as a Single Source of Truth (SSOT) to classify execution states, metadata logs, and bound execution context IDs.

At this foundation phase:
* **No Runtime Logic**: The state layer does not trigger lifecycle state transitions, manage active timer events, update execution databases, synchronize processes, or persist records. It strictly models the final static schema.
* **Complete Immutability (Multi-Layer Object.freeze)**: All elements, including metadata logs, context blocks, state descriptions, and the blueprint container itself, are strictly frozen at creation time.
* **Perfect Determinism**: Avoids uuid generation, clock timestamp lookups, or runtime resolutions.
* **Separation of Concerns**: Schedulers, state machines, active lifecycles, and transaction persistence are decoupled in separate layers and phases.

---

## 2. Data Models & Schemas

### 2.1 StateType
The category/type of the execution state.

```typescript
export enum StateType {
  FOUNDATION = 'FOUNDATION', // The core blueprint state (current phase)
  RUNTIME    = 'RUNTIME',    // Active agent execution state (future)
  SIMULATION = 'SIMULATION', // Sandbox execution state (future)
  PLUGIN     = 'PLUGIN',     // Third-party runner state (future)
  AI         = 'AI'          // Adaptive AI state (future)
}
```

### 2.2 StateClassification
Static categorization of the execution state.

```typescript
export enum StateClassification {
  UNKNOWN   = 'UNKNOWN',
  PENDING   = 'PENDING',
  READY     = 'READY',
  RUNNING   = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

#### Differentiating ResultStatus vs StateClassification
* **ResultStatus (Outcome Classification)**: Classifies the final execution outcomes and results (e.g. `SUCCESS`, `FAILURE`, `PARTIAL`). It represents the classification of what happened *after* execution is done.
* **StateClassification (Execution State Classification)**: Classifies the active execution states (e.g. `PENDING`, `READY`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`). It represents the classification of the process lifecycle state.
* In this foundation phase, neither handles dynamic state transitions, transition checks, or lifecycle triggers.

### 2.3 StateMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface StateMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.4 ExecutionStateContext
Stores references/IDs to related execution entities.

> [!IMPORTANT]
> **Boundary Rule**: `ExecutionStateContext` stores only identifier strings (IDs) of other static execution blocks (`executionRequestId`, `executionResultId`, `executionEngineId`, `executionRegistryId`) to ensure loose coupling and maintain a strict Single Source of Truth (SSOT). It does **NOT** hold references to the objects themselves, nor does it perform resolution or instantiation.

```typescript
export interface ExecutionStateContext {
  readonly executionRequestId: string;        // Target Execution Request ID
  readonly executionResultId: string;         // Target Execution Result ID
  readonly executionEngineId: string;         // Target Execution Engine ID
  readonly executionRegistryId: string;       // Target Execution Registry ID
}
```

### 2.5 ExecutionState
The execution state model.

```typescript
export interface ExecutionState {
  readonly id: string;                        // Unique state ID (e.g. execution-state-01)
  readonly name: string;                      // State name
  readonly description: string;               // Purpose/description
  readonly stateType: StateType;              // State type
  readonly classification: StateClassification; // State lifecycle categorization
  readonly context: ExecutionStateContext;    // Bound static execution context IDs
  readonly metadata: StateMetadata;            // Entry metadata block
}
```

---

## 3. ExecutionStateBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution state descriptor. It exposes pure getter interfaces to request state specs safely.

```typescript
export interface ExecutionStateBlueprint {
  getState(): ExecutionState;
  getContext(): ExecutionStateContext;
  getMetadata(): StateMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution State resolves statically at the bottom of the DevelopmentRules static hierarchy:

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
```

`DevelopmentRules.getExecutionState(rule)` evaluates the static resolution chain directly and returns the singleton request definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `transition()`, `moveTo()`, `start()`, `stop()`, `resume()`, `cancel()`, `update()`, `synchronize()` must NOT exist in the blueprint container or static model.
* **Multi-Layer Immutability Guarantee**:
  - Individual Metadata: `Object.freeze(metadata)`
  - Individual Context: `Object.freeze(context)`
  - State Model: `Object.freeze(state)`
  - Blueprint Container: `Object.freeze(EXECUTION_STATE_BLUEPRINT)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the state blueprint must return the exact same frozen reference.
