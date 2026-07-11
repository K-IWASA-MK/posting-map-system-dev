# Dependency Rules

This document outlines the strict architectural boundary and dependency rules for the POSTING MAP Product Runtime.

## Core Principles

1. **Unidirectional Dependency Rule**: Dependencies must always point inwards towards the Core, never outwards.
2. **Layer Separation**: Code is divided into strict layers to ensure maintainability and separation of concerns.

## Layers & Allowed Dependencies

### 1. `domain` (Sprint 5 onwards)
* **Description**: Business logic specific to POSTING MAP (Field Operations, Billing, Dashboard, etc.)
* **Allowed to depend on**: `foundation`, `core`
* **Prohibited**: Cannot depend on `infrastructure` directly. Cannot be depended on by `core` or `foundation`.

### 2. `foundation` (Sprint 3-4)
* **Description**: Cross-cutting platform concerns (Authentication, Authorization, Licensing, Feature Access, Validation).
* **Allowed to depend on**: `core`
* **Prohibited**: Cannot depend on `domain`. Should remain agnostic of specific POSTING MAP business logic.

### 3. `core`
* **Description**: Primitive types, fundamental APIs, interfaces, global context, and base exceptions.
* **Allowed to depend on**: None (No outward dependencies).
* **Prohibited**: Cannot depend on `domain`, `foundation`, or `infrastructure`.

### 4. `infrastructure`
* **Description**: External integrations, concrete implementations of adapters (GAS API execution, Spreadsheet readers, external fetches).
* **Allowed to depend on**: `core`, `foundation` (for implementing interfaces defined within them).
* **Prohibited**: Cannot be directly imported by `domain` or `foundation` business logic. Depend on abstractions instead.

## Summary of Rules

**✅ PERMITTED:**
* `domain` → `foundation`
* `domain` → `core`
* `foundation` → `core`
* `infrastructure` → `core` / `foundation`

**❌ PROHIBITED:**
* `core` → `domain` (Core cannot know about business logic)
* `foundation` → `domain` (Foundation must be generic)
* `domain` → `infrastructure` (Domain must rely on interfaces)

## Advanced Rules (Sprint 5 Onwards)

### Rule 1: Domain Cross-Dependency Prohibition
**Domain modules cannot directly depend on other domain modules.**
* **Reason**: Changing billing logic should not break field operations.
* **Prohibited**: `field` → `billing`
* **Permitted**: Use a `core` contract or abstract it to a shared domain service.

### Rule 2: Infrastructure Concrete Leakage Prohibition
**No concrete infrastructure class may appear outside the infrastructure layer.**
* **Prohibited**: `import { SpreadsheetReader } from "@infra/gas";` inside the `domain` layer.
* **Permitted**: The `domain` layer must only use interfaces defined in `core` or `foundation`.

### Rule 3: Foundation API Stability Rule
**Foundation public interfaces require backward compatibility.**
* **Reason**: Contexts like `AuthenticationContext` or `LicenseContext` will be heavily depended on by all Domains.
* **Prohibited**: Destructive changes (e.g., renaming `identityId` to `identity`).
* **Permitted**: Extension mechanisms (e.g., adding `withIdentity()`).

## Sprint 5 Development Standards

When adding new domains in Sprint 5 and beyond, use the following standardized directory structure under `src/domain/{feature}`:
```
src/domain/
  └─ {feature}/
      ├─ entities/
      ├─ services/
      ├─ repositories/
      ├─ policies/
      └─ queries/
```

## Enforcement
These rules will be enforced via CI using a dependency-check script (`npm run architecture:test`).
* Core imports Domain? → **FAIL**
* Foundation imports Domain? → **FAIL**
* Domain imports Infrastructure? → **FAIL**
