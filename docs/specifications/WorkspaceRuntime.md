# Workspace Runtime Specification

## Purpose

Workspace Runtime manages the execution environment boundaries for project sessions in the AIOS Platform. Operating on top of the Execution Runtime and Session layers, it isolates temporary directories, handles dynamic environment mappings, and guarantees execution safety through mutual exclusion locks.

---

## Workspace Runtime Constitution

The Workspace Runtime module strictly adheres to the following core constraints:

> 1. **Workspace Runtime prepares environments only**: It allocates directories, registers locks, and clears files.
> 2. **Workspace Runtime never spawns processes**: Spawning processes is strictly delegated to the `LauncherExecutionRuntime` plane (G6-12).
> 3. **Workspace Runtime never evaluates policy**: It acts on trust and does not review project lifecycle statuses (G6-11).
> 4. **Workspace Runtime never owns session lifecycle**: It is unaware of session runtime timers or exit statuses (G6-13).
> 5. **Workspace Runtime never persists execution history**: It only registers locks locally during process lifespans.

---

## Decoupled Architecture Layout

The layer is decoupled into specialized entities:

* **`WorkspaceContext`**: An immutable model containing configuration parameters (`sessionId`, `projectId`, `workspacePath`, `tempPath`, `lockFilePath`, `envBindings`).
* **`WorkspaceContextBuilder`**: Compiles configuration metadata. It is a stateless builder that does not perform IO operations.
* **`TempDirectoryManager`**: Allocates the session `tmp/` folder and cleans it up. It cleans up temporary files inside `tmp/` without deleting the project workspace root directory.
* **`WorkspaceLockManager`**: Handles mutual exclusion using the pluggable `ILockStorage` dependency injection.
* **`FileLockStorage`**: Implements filesystem-based locks (e.g. creating/deleting `.lock-[projectId]` files).
* **`WorkspaceRuntimePreparer`**: Orchestrates lock acquisition and folder allocation. Throws structured errors.
* **`WorkspaceRuntimeTeardown`**: Cleanups temp folders and releases runtime locks.

---

## Workspace Runtime Error Codes

All exceptions thrown inside the Workspace plane are structured under `WorkspaceRuntimeError` with the following error codes:

| Error Code | Category | Description |
|---|---|---|
| `WORKSPACE_LOCKED` | Lock Constraint | The target project directory is already locked by another executing session. |
| `TEMP_DIRECTORY_FAILED` | Filesystem IO | Failed to allocate or create the sandboxed `tmp/` folder. |
| `LOCK_RELEASE_FAILED` | Lock Cleanup | Failed to release lock constraints on teardown. |

---

## Preparation and Teardown Flow

```
[Session Start (セッション起動)]
            │
            ├──> [WorkspaceContextBuilder] (コンテキスト組み立て)
            ├──> [WorkspaceRuntimePreparer]
            │         │
            │         ├──> check/write lock via [WorkspaceLockManager] ──> if locked: throws WORKSPACE_LOCKED
            │         └──> create tmp/ via [TempDirectoryManager] ───────> if failed: throws TEMP_DIRECTORY_FAILED
            │
            ▼
     [Session Active]
            │
            ▼
[Session Exit (セッション終了)]
            │
            └──> [WorkspaceRuntimeTeardown]
                      │
                      ├──> clean tmp/ via [TempDirectoryManager]
                      └──> release lock via [WorkspaceLockManager]
```
