# Execution Request Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution Request Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution Request** acts as a static, declarative definition of an execution trigger. It is a Single Source of Truth (SSOT) representing the input parameters, target configuration registries, and execution scopes.

At this foundation phase:
* **No Runtime Logic**: The request layer does not validate input parameters dynamically, dispatch queries, trigger queues, retry, timeout, or execute workflows. It strictly models the data payload.
* **Complete Immutability (Multi-Layer Object.freeze)**: All properties, including individual metadata structures, request contexts, requests, and the blueprint container itself, are strictly frozen.
* **Perfect Determinism**: Avoids all dynamic ID generation (UUIDs), dynamic date calculation, or runtime logic during model loading and resolution.
* **Separation of Concerns**: Request routing, pipeline dispatching, adapter runs, and queuing mechanisms are isolated in future phases.

---

## 2. Data Models & Schemas

### 2.1 RequestType
The category/type of the execution request.

```typescript
export enum RequestType {
  FOUNDATION = 'FOUNDATION', // The core blueprint request (current phase)
  RUNTIME    = 'RUNTIME',    // Active agent execution request (future)
  SIMULATION = 'SIMULATION', // Sandbox execution request (future)
  PLUGIN     = 'PLUGIN',     // Third-party runner request (future)
  AI         = 'AI'          // Adaptive AI request (future)
}
```

### 2.2 RequestMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface RequestMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.3 ExecutionRequestContext
Stores references/IDs to related execution entities.

> [!IMPORTANT]
> **Boundary Rule**: `ExecutionRequestContext` strictly stores references (ID strings or name strings) to other static definition blocks (Capability, Pipeline, Runtime, Execution Engine, Execution Registry). It **MUST NOT** perform resolution, instantiation, active searching, or generation of these entities itself.

```typescript
export interface ExecutionRequestContext {
  readonly capability: string;                // Target Capability reference (ID/Name)
  readonly pipeline: string;                  // Target Pipeline reference (ID/Name)
  readonly runtime: string;                    // Target Runtime reference (ID/Name)
  readonly executionEngine: string;            // Target Execution Engine reference (ID/Name)
  readonly executionRegistry: string;          // Target Execution Registry reference (ID/Name)
}
```

### 2.4 ExecutionRequest
The execution request model containing context definitions.

```typescript
export interface ExecutionRequest {
  readonly id: string;                        // Unique request ID (e.g. execution-request-01)
  readonly name: string;                      // Request name
  readonly description: string;               // Purpose/description
  readonly requestType: RequestType;          // Request type
  readonly context: ExecutionRequestContext;  // Bound static execution context references
  readonly metadata: RequestMetadata;         // Entry metadata block
}
```

---

## 3. ExecutionRequestBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution request descriptor. It exposes pure getter interfaces to request request specs safely.

```typescript
export interface ExecutionRequestBlueprint {
  getRequest(): ExecutionRequest;
  getContext(): ExecutionRequestContext;
  getMetadata(): RequestMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution Request resolves statically at the bottom of the DevelopmentRules static hierarchy:

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
```

`DevelopmentRules.getExecutionRequest(rule)` evaluates the static resolution chain directly and returns the singleton request definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `validate()`, `dispatch()`, `execute()`, `run()`, `send()`, `enqueue()`, `retry()`, `cancel()` must NOT exist in the blueprint container or static model.
* **Multi-Layer Immutability Guarantee**:
  - Individual Metadata: `Object.freeze(metadata)`
  - Individual Context: `Object.freeze(context)`
  - Request Model: `Object.freeze(request)`
  - Blueprint Container: `Object.freeze(EXECUTION_REQUEST_BLUEPRINT)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the request blueprint must return the exact same frozen reference.
