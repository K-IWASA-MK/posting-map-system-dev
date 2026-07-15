# Test Runtime Specification

## Purpose

The Test Runtime acts as the primary quality gate controller for the AIOS Platform. It unifies unit tests, integration tests, and quality-hook simulation regression testing across multiple language platforms (TypeScript / Python / Node.js) and abstracts runtime differences (virtual environments, path shebangs).

---

## Test Runtime Constitution

The Test Runtime conforms to the following strict design constraints to ensure separation of concerns:

> 1. **Test Discovery discovers tests only**: Scanning folders, path checking, and regex file lookup must be implemented inside `TestDiscovery`; runners must not look up paths.
> 2. **Test Policy evaluates test outcomes only**: Final gating decisions (PASS / FAIL / SKIPPED status mapping) are evaluated as a pure function by `TestPolicy` based on output summaries.
> 3. **Test Runner orchestrates only**: `TestRunner` orchestrates the test lifecycle (calls discovery, invokes runners, triggers policy evaluation). It must never spawn processes directly, scan directories, or judge results.
> 4. **Individual runners execute tests only**: `TypeScriptTestRunner`, `PythonTestRunner`, and `SimulationTestRunner` are solely responsible for executing files handed to them and wrapping exit statuses.

---

## Testing Workflow Flowchart

The testing execution flow is mapped as follows:

```
[npm run test] ──> [TestRunner (オーケストレーター)]
                          │
                          ├──> [TestDiscovery (テスト検出)]
                          │
                          ├──> [TypeScriptTestRunner (TSテスト実行)]
                          ├──> [PythonTestRunner (Pyテスト実行 - 動的環境パス)]
                          ├──> [SimulationTestRunner (Nodeシミュレーション実行)]
                          │
                          ▼
                    [TestPolicy (最終合否評価)]
                          │
                          ▼
                   [Unified Test Summary] ──> Process Exit Status
```

---

## Python Environment Discovery Hierarchy

`PythonTestRunner` does not rely on hardcoded script shebang paths (which break during environment moves). Instead, it queries `TestEnvironment` to locate the active Python interpreter using the following priority order:

1. **Virtual Environment Interpreter (`.venv`)**:
   - Checks `workspace/.venv/bin/python`, `workspace/.venv/bin/python3`, or `workspace/.venv/Scripts/python.exe`.
2. **UV Package Manager (`uv`)**:
   - Runs tests via `uv run python` if `uv` command is available.
3. **Poetry Package Manager (`poetry`)**:
   - Runs tests via `poetry run python` if `poetry` command is available.
4. **System Python (`python3` / `python`)**:
   - Falls back to `python3` or `python` present on the active system `PATH`.
