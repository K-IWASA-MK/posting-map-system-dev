# Plugin Runtime Specification

## Purpose

Plugin Runtime provides the execution validation, sandboxing, and security boundary layer for pluggable modules running inside the AIOS Platform. Built on top of the Workspace and Execution runtime components, it checks requested execution scopes against authorization profiles, maps parameters, and spawns isolated pluggable sessions.

---

## Plugin Runtime Constitution

The Plugin Runtime plane strictly adheres to the following core constraints:

> 1. **Plugin Runtime evaluates plugin permissions only**: It does not evaluate project status or lifecycle policies.
> 2. **Plugin Runtime never evaluates project policies**: Project lifecycle verification is strictly managed in the `Launcher` plane (G6-11).
> 3. **Plugin Runtime never modifies workspace ownership**: Workspace preparation, locking, and directory cleanup are delegated to the `WorkspaceRuntime` plane (G6-14).
> 4. **Plugin Runtime never bypasses Launcher decisions**: Execution processes are only spawned for valid, verified runtime environments.
> 5. **Plugin Runtime delegates execution to Launcher Execution Runtime**: Spawning processes is handled by calling the `LauncherExecutionRuntime` plane (G6-12).

---

## Sandbox and Permission Evaluation

Plugins specify authorization scopes using the `PluginPermission` type alias:
- `'read_file'`: Allows local workspace reading operations.
- `'write_file'`: Allows local workspace writing operations.
- `'network'`: Allows socket and network connections.

`PluginSandbox` provides a stateless, pure evaluation function:

```typescript
validatePermissions(config, requestedPermissions) -> PermissionEvaluationResult
```

If the requested scope is outside the plugin's configuration profile, the evaluation returns `decision: 'deny'`. The `PluginRuntime` orchestrator then intercepts execution and throws a `PLUGIN_PERMISSION_DENIED` error code.

---

## Plugin Runtime Error Codes

| Error Code | Cause Category | Description |
|---|---|---|
| `PLUGIN_PERMISSION_DENIED` | Sandbox Check | Plugin requested authorization scopes not permitted in its config. |
| `PLUGIN_CONFIG_INVALID` | Structure Validation | Entrypoint, parameters, or permissions metadata is malformed. |
| `PLUGIN_ENTRYPOINT_NOT_FOUND` | Path / IO Error | Target JS script file for the plugin entrypoint does not exist. |
| `PLUGIN_RUNTIME_INITIALIZATION_FAILED` | Internal Error | Spawn, workspace locks, or mapping operations failed. |

---

## Architecture Execution Flow

```
[Plugin Execution Request]
            │
            ├──> [PluginSandbox.validatePermissions()] ──> if deny: throws PLUGIN_PERMISSION_DENIED
            │
            ├──> [PluginEnvironmentBindingsProvider] (組み立て: AIOS_ALLOWED_PERMISSIONS)
            │
            ├──> [WorkspaceContextBuilder] & [WorkspaceRuntimePreparer]
            │         │
            │         └──> prepare directory and locks (Workspace Runtime)
            │
            ├──> [LauncherExecutionRuntime.execute()]
            │         │
            │         └──> spawns physical node process (Execution Runtime)
            │
            ▼
   [ExecutionSession] (Session Manager tracks)
```
