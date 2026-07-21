# Workflow Runtime Foundation v1.0 - SPEC Specification

System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO / AI Director
Status: STABLE RELEASE (v1.0.0)

---

## ■ Mission (目的)
複数の AI社員を依存関係（dependsOn）に基づいて連鎖動作させ、一つの統合的な業務フローを決定論的・非侵襲的に完遂に導く Workflow Runtime の設計仕様。

---

## ■ Key Principles (遵守原則)
1. **Delegation of Execution**: Workflow Runtime は成果物を直接編集・生成せず、Task の生成と Assignment Runtime へのディスパッチのみを行う。
2. **Strict Dependency Resolution**: `dependsOn` で定義された前提ステップが完了 (`COMPLETED`) していない場合、後続ステップの Task 生成を行わない。
3. **Workflow State Transition (Enum)**:
   `CREATED` ──► `RUNNING` ──► (`WAITING`) ──► `COMPLETED` / `FAILED`
4. **Single Source of Truth (SSOT)**: `02_SYSTEM/workflows.json` をワークフロー定義の正本とする。
