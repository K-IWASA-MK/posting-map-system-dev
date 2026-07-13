# Execution Resolver Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution Resolver Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution Resolver** represents the static configuration blueprint for resolving execution configurations within the Execution Layer. It serves as a Single Source of Truth (SSOT) to classify resolution rules, contexts, and strategies.

At this foundation phase:
* **No Runtime Logic**: The resolver does not perform lookup queries, evaluate dynamic mapping variables, execute pipeline matching algorithms, dispatch requests, or execute active plans. It strictly models the final static schema.
* **Complete Immutability (Multi-Layer Object.freeze)**: All elements, including metadata logs, context blocks, resolver descriptions, and the blueprint container itself, are strictly frozen at creation time.
* **Perfect Determinism**: Does not use timestamps, random numbers, or dynamic lookups.
* **Separation of Concerns**: Schedulers, matching algorithms, dynamic execution engine resolvers, and dispatch active engines are decoupled in separate layers and phases.

---

## 2. Data Models & Schemas

### 2.1 ResolverType
The category/type of the execution resolver.

```typescript
export enum ResolverType {
  FOUNDATION = 'FOUNDATION', // The core blueprint resolver (current phase)
  RUNTIME    = 'RUNTIME',    // Active agent resolver (future)
  SIMULATION = 'SIMULATION', // Sandbox test run resolver (future)
  PLUGIN     = 'PLUGIN',     // Third-party resolver (future)
  AI         = 'AI'          // Adaptive AI outcome resolver (future)
}
```

### 2.2 ResolverStrategy
Static classification of resolution mechanisms.

> [!IMPORTANT]
> **Boundary Rule**: `ResolverStrategy` is a static category classification (STATIC, MAPPING, REGISTRY, PIPELINE) defining the resolution method setup. It **MUST NOT** perform active runtime resolution, lookups, searches, or algorithmic evaluations.

```typescript
export enum ResolverStrategy {
  STATIC   = 'STATIC',
  MAPPING  = 'MAPPING',
  REGISTRY = 'REGISTRY',
  PIPELINE = 'PIPELINE'
}
```

### 2.3 ResolverMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface ResolverMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.4 ExecutionResolverContext
Stores references/IDs to related execution entities.

> [!IMPORTANT]
> **Boundary Rule**: `ExecutionResolverContext` stores only identifier strings (IDs) of other static execution blocks (`executionEngineId`, `executionRegistryId`, `executionRequestId`, `executionResultId`, `executionStateId`) to ensure loose coupling and maintain a strict Single Source of Truth (SSOT). It does **NOT** hold references to the objects themselves, nor does it perform resolution or instantiation.

```typescript
export interface ExecutionResolverContext {
  readonly executionEngineId: string;         // Target Execution Engine ID
  readonly executionRegistryId: string;       // Target Execution Registry ID
  readonly executionRequestId: string;        // Target Execution Request ID
  readonly executionResultId: string;         // Target Execution Result ID
  readonly executionStateId: string;          // Target Execution State ID
}
```

### 2.5 ExecutionResolver
The execution resolver model.

```typescript
export interface ExecutionResolver {
  readonly id: string;                        // Unique resolver ID (e.g. execution-resolver-01)
  readonly name: string;                      // Resolver name
  readonly description: string;               // Purpose/description
  readonly resolverType: ResolverType;        // Resolver type
  readonly strategy: ResolverStrategy;        // Resolver static strategy category
  readonly context: ExecutionResolverContext;  // Bound static execution context IDs
  readonly metadata: ResolverMetadata;        // Entry metadata block
}
```

---

## 3. ExecutionResolverBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution resolver descriptor. It exposes pure getter interfaces to request resolver specs safely.

```typescript
export interface ExecutionResolverBlueprint {
  getResolver(): ExecutionResolver;
  getContext(): ExecutionResolverContext;
  getMetadata(): ResolverMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution Resolver resolves statically at the bottom of the DevelopmentRules static hierarchy:

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
```

`DevelopmentRules.getExecutionResolver(rule)` evaluates the static resolution chain directly and returns the singleton request definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `resolve()`, `lookup()`, `search()`, `match()`, `evaluate()`, `dispatch()`, `execute()` must NOT exist in the blueprint container or static model.
* **Multi-Layer Immutability Guarantee**:
  - Individual Metadata: `Object.freeze(metadata)`
  - Individual Context: `Object.freeze(context)`
  - Resolver Model: `Object.freeze(resolver)`
  - Blueprint Container: `Object.freeze(EXECUTION_RESOLVER_BLUEPRINT)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the resolver blueprint must return the exact same frozen reference.
