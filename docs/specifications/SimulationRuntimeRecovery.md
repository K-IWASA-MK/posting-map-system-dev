# Simulation Runtime Recovery Specification

## 1. Failure Summary & Root Cause

During local development committing (`git commit`) and hook execution, the quality gate runner (`hook_runner.js`) was crashing immediately due to a missing module dependency (`../../audit/SimulationRuntime`), blocking all commits.

### Root Cause
During Generation 6 restructuring, the legacy JS `audit/` folder was staged to be archived under `knowledge/legacy/generation-5/audit/`. However, the active pre-commit hook (`hook_runner.js`) and tests (`tests/simulation/`) still relied on relative paths resolving to the root `audit/` folder.

---

## 2. Recovery Strategy: Re-homing

To resolve this issue while complying with the strict Generation 6 separation constraints, the active simulation runtime has been **re-homed** from the historical archives directly into the testing infrastructure under `tests/simulation/runtime/`.

* The files under `knowledge/legacy/` remain as **historical snapshots only**.
* The new files under `tests/simulation/runtime/` are the **only active implementation**.

### Re-homed Files Location: `tests/simulation/runtime/`
* `SimulationRuntime.js`
* `AuditWriter.js` (adjusted relative path to `tools/simulation_audit.log` from `../../` to `../../../`)
* `ResultGenerator.js`
* `ScenarioRunner.js`
* `ContractValidator.js`
* `MockKernel.js`

---

## 3. Generation 6 Constitution: Simulation Infrastructure Rule

To maintain the architectural cleanliness of the AIOS Platform and prevent regression errors, the following rule is added to the system constitution:

> ### Simulation Infrastructure Rule
> 
> 1. **Classification**: Simulation Runtime is strictly classified as part of the **Testing Infrastructure**. It is not part of the active production runtime.
> 2. **Prohibited Dependencies**: The active simulation runtime must **never** depend on files under `knowledge/legacy/`.
> 3. **Prohibited Directories**: The active simulation runtime must **never** be placed inside the `runtime/` or `core/` directories, to maintain clear separation between production runtime and testing tools.
> 4. **Sole Active Directory**: The active simulation runtime belongs exclusively under `tests/simulation/runtime/`.

---

## 4. Path Validation Mapping

The import paths are resolved strictly as follows:

```
tests/
  simulation/
    runtime/             <-- Simulation Runtime Engine
    ContractRegressionTest.js
    ScenarioRegressionTest.js
    BoundaryTest.js
    SimulationTestRunner.js
```

### Imports Update Mapping

| File | Old Require Path | New Require Path |
|---|---|---|
| `tests/simulation/ContractRegressionTest.js` | `../../audit/SimulationRuntime` | `./runtime/SimulationRuntime` |
| `tests/simulation/ScenarioRegressionTest.js` | `../../audit/SimulationRuntime` | `./runtime/SimulationRuntime` |
| `tests/simulation/SimulationTestRunner.js` | `../../audit/AuditWriter` | `./runtime/AuditWriter` |
| `tests/simulation/BoundaryTest.js` | `../../audit` (Directory check) | `./runtime` (Directory check) |
| `tools/hooks/hook_runner.js` | `../../audit/AuditWriter` | `../../tests/simulation/runtime/AuditWriter` |
| `tools/hooks/install-hooks.sh` | `$REPO_ROOT/src/simulation/AuditWriter` | `$REPO_ROOT/tests/simulation/runtime/AuditWriter` |
