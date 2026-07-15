# Project Manager Specification

## Purpose

Project Manager acts as the control plane for official projects recognized by the AIOS Platform. Sitting on top of the Project Discovery layer, it manages project lifecycle states, aggregates configuration validation results, and exposes query and state transition APIs to platform runtimes.

---

## Management Constitution

The Project Manager module conforms to the following strict architectural constraints:

> ### Manager Never Executes
> 
> 1. **Management Plane Only**: Project Manager is strictly a management plane and does not load or run workloads.
> 2. **No Execution/Initialization**: It must never execute, modify, or initialize any project code or assets.
> 3. **Indirect Dependency**: It operates solely on Discovery results (`ProjectDiscoveryResult`) and never directly crawls the root `projects/` directory.

---

## Discovery & Management Flow

The orchestration flow is mapped as follows:

```
[Project Discovery (認識)]
      │
      ▼
[Project Manager (管理)] ──> Receives ProjectDiscoveryResult
      │
      ├──> [Project Validation (構造検証)] ──> Checks for mandatory files presence
      │
      └──> [Project Lifecycle (状態遷移)] ──> Asserts transition constraints (State Machine)
      │
      ▼
[Project Metadata (集約)] ──> Compiles ProjectInfo, Validation, Lifecycle & Warnings
      │
      ▼
[Management Result (出力)] ──> Exposes metadata lists and transitions to runtimes
```

---

## State Machine Rules

The project lifecycle is governed by a strict state machine:

* **Allowed States**: `development`, `production`, `archived`.
* **State Transition Graph**:
  - `development` ──> `production` (Allowed)
  - `production` ──> `archived` (Allowed)
  - `development` ──> `archived` (Forbidden/Prohibited - must go through production first or is explicitly blocked to enforce quality gate validations)
  - All reverse transitions (e.g., `production -> development` or `archived -> production`) are strictly prohibited.
  - No-op transitions (e.g., `development -> development`) are allowed.

---

## Filesystem Validation List

To verify that a discovered directory represents a valid, runnable project layout, `ProjectValidation` checks for the presence of the following files:

1. **`package.json`**: Dependency manifest declaration.
2. **`manifest.json`**: Product configuration metadata.
3. **`README.md`**: Project documentation file.

*Validation Constraint*: The validator only checks the physical existence of these files (via `fs.existsSync`). It does **not** read, parse, or evaluate their contents.

---

## Future Extensions

The aggregated metadata will serve as the foundation for the following downstream components:

1. **Launcher integration**: Launchers will check if the target project's `validation.valid` property is `true` before booting it.
2. **Marketplace installation**: Installers will register downloaded projects by verifying status rules.
3. **Licensing checks**: Managers can be extended with `licensing` structures in `ProjectMetadata` to block unauthorized execution.
