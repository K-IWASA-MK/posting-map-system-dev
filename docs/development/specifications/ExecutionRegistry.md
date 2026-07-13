# Execution Registry Specification

This document defines the core architecture, data schemas, validation rules, design guidelines, and structural boundaries for the **Execution Registry Foundation** within the AIOS (Advanced Agentic Operating System).

---

## 1. Overview & Core Philosophy

The **Execution Registry** acts as a Single Source of Truth (SSOT) to manage execution descriptors and metadata statically. It holds execution registry entries containing capability and engine configuration references.

At this foundation phase:
* **No Runtime Logic**: The registry does not support dynamic registration, unregistration, caching, query lookup logic, or runtime scheduling. It is strictly a static, immutable declaration engine.
* **Complete Immutability (Three-Layer Object.freeze)**: All structures, including individual entries, entry list arrays, metadata blocks, and the registry container itself, are strictly frozen at compile/creation time.
* **Perfect Determinism**: Contains no random values, date generation, or database operations, making resolution completely stable and predictable.
* **Separation of Concerns**: Schedulers, runtime runners, adapters, and dynamic discovery are separated into future phases.

---

## 2. Data Models & Schemas

### 2.1 RegistryType
The category/type of the execution registry.

```typescript
export enum RegistryType {
  FOUNDATION = 'FOUNDATION', // The core blueprint registry (current phase)
  RUNTIME    = 'RUNTIME',    // Active agent execution registry (future)
  PLUGIN     = 'PLUGIN',     // Third-party runner registry (future)
  SIMULATION = 'SIMULATION', // Sandbox execution registry (future)
  AI         = 'AI'          // Adaptive AI model registry (future)
}
```

### 2.2 RegistryMetadata
Structural metadata matching standard metadata patterns in AIOS.

```typescript
export interface RegistryMetadata {
  readonly author: string;                    // Creator/Maintainer tag
  readonly version: string;                   // Specification semantic version
  readonly createdAt: string;                 // ISO8601 creation timestamp
  readonly updatedAt: string;                 // ISO8601 update timestamp
  readonly phase: string;                     // AIOS Sprint Phase identifier
}
```

### 2.3 ExecutionRegistryEntry
Static entry representing an Execution Definition registered in the system.

```typescript
export interface ExecutionRegistryEntry {
  readonly id: string;                        // Unique entry ID (e.g. execution-entry-01)
  readonly name: string;                      // Name of execution definition
  readonly description: string;               // Purpose/description
  readonly engineType: string;                // Engine type required (e.g. FOUNDATION)
  readonly capability: string;                // Target Capability name or ID
  readonly metadata: RegistryMetadata;        // Detailed entry metadata
}
```

### 2.4 ExecutionRegistry
The registry descriptor wrapping the entries and parent metadata.

```typescript
export interface ExecutionRegistry {
  readonly id: string;                        // Unique registry ID
  readonly name: string;                      // Registry name
  readonly version: string;                   // Specification version
  readonly description: string;               // Description
  readonly entries: readonly ExecutionRegistryEntry[]; // Static registry entries
  readonly metadata: RegistryMetadata;        // Registry-level metadata block
}
```

---

## 3. ExecutionRegistryBlueprint Container

The blueprint acts as a secure, immutable container wrapping the execution registry descriptor. It exposes pure getter interfaces to request registry specs safely.

```typescript
export interface ExecutionRegistryBlueprint {
  getRegistry(): ExecutionRegistry;
  getEntries(): readonly ExecutionRegistryEntry[];
  getMetadata(): RegistryMetadata;
}
```

---

## 4. Rule Integration & Static Mapping

The Execution Registry resolves statically at the bottom of the DevelopmentRules static hierarchy:

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
```

`DevelopmentRules.getExecutionRegistry(rule)` evaluates the static resolution chain directly and returns the singleton registry definition. No database queries or runtime evaluation loops are performed.

---

## 5. Design & Immutability Rules

* **Strict No-Run / No-Mutation Policy**: Methods such as `register()`, `unregister()`, `find()`, `lookup()`, `resolve()`, `execute()`, `dispatch()`, `run()` must NOT exist in the blueprint container or static model.
* **Three-Layer Immutability Guarantee**:
  - Individual Entry: `Object.freeze(entry)`
  - Entry List: `Object.freeze(entries)`
  - Registry Model: `Object.freeze(registry)`
  - Metadata: `Object.freeze(metadata)`
* **Deterministic Guarantee**: Repeated calls to resolve or fetch the registry blueprint must return the exact same frozen reference.
