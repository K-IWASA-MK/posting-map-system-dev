# Launcher Foundation Specification

## Purpose

Launcher Foundation defines the execution gatekeeper mechanism of the AIOS Platform. Sitting on top of the Project Manager plane, it verifies that project boot requests comply with platform policies, state machine constraints, and file structures before handoff to the runtime executor.

---

## Launcher Constitution

The Launcher module conforms to the following strict architectural constraints:

> ### Launcher Never Spawns
> 
> 1. **Policy Gate Only**: The Launcher Foundation is a validation and safety check plane; it does not start runtimes.
> 2. **No Execution/Initialization**: It must never execute commands, spawn processes, run shell commands, initialize runtimes, or load project code.
> 3. **Launch Decision Only**: Launcher produces launch decisions only.
> 4. **Input Separation**: It evaluates requests against `ProjectManager` metadata results. It does not access directory structures directly.

---

## Boot Validation Flow

The validation flow is mapped as follows:

```
[Launcher Request (起動要求)]
      │
      ▼
[Launcher (起動ゲートオーケストレーター)]
      │
      ├──> [LauncherValidator (構文・存在チェック)]
      │         │
      │         └──> queries [ProjectManager (状態・ファイルメタデータ)]
      │
      └──> [LauncherPolicy (ポリシー検証 - 純粋関数)] ────> Asserts launch rules
      │
      ▼
[LauncherResult (検証結果・メタデータ)]
```

---

## Launcher Policy Rules

A project request is only approved if it clears all of the following gates:

1. **Existence Gate (`PROJECT_NOT_FOUND`)**:
   - The requested `projectId` must be registered in the active `ProjectManager`. Missing IDs trigger registration errors.

2. **Parameter Gate (`MISSING_PROJECT_ID`, `INVALID_LAUNCH_MODE`)**:
   - The request must specify a valid `projectId`.
   - The execution `mode` must be explicitly declared as either `development` or `production`.

3. **Status Gate (`PROJECT_ARCHIVED`)**:
   - Projects with a lifecycle state of `archived` are strictly prohibited from launching.

4. **Structure Gate (`VALIDATION_FAILED`)**:
   - The target directory must satisfy the filesystem structure requirement (`validation.valid === true`). Projects missing any of the required core layout files (`package.json`, `manifest.json`, `README.md`) are blocked from launch.

---

## Error Codes Dictionary

The following diagnostic error codes are returned in `LauncherResult`:

| Error Code | Category | Description |
|---|---|---|
| `MISSING_PROJECT_ID` | Syntax | The launch request did not specify a `projectId`. |
| `INVALID_LAUNCH_MODE` | Syntax | The execution mode was not 'development' or 'production'. |
| `PROJECT_NOT_FOUND` | Existence | The requested project is not registered in the manager. |
| `PROJECT_ARCHIVED` | Policy | The project lifecycle state is archived. |
| `VALIDATION_FAILED` | Policy | The project workspace is missing mandatory configuration files. |

---

## Future Extensions

The validation results and metadata generated in G6-11 will pave the way for execution:

- **Sprint G6-12 (Launcher Execution Runtime)**: Introduces the execution context layer. Upon receiving a successful `LauncherResult` (where decision is `allow`), the execution runtime will spawn sandboxed processes, configure environmental bindings, and manage running PIDs.
- **Sprint G6-13 (Installer)**: Standardizes template creation to guarantee G6-11 structure gate requirements are satisfied out-of-the-box.
