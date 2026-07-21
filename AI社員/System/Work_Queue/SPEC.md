# Work Queue Foundation v1.0 - SPEC Specification

System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO / AI Director
Status: STABLE RELEASE (v1.0.0)

---

## ■ Mission (目的)
AI Workforce 全体で共有される唯一のタスク集積・順序制御領域 `Work Queue` の設計仕様。

---

## ■ Key Principles (遵守原則)
1. **Single Source of Truth (SSOT)**: `02_SYSTEM/work_queue.json` を全 Queue アイテムの唯一の正本とする。
2. **Deterministic Ordering**: 1. Priority (CRITICAL > HIGH > NORMAL > LOW), 2. createdAt (昇順) のみで順序決定。ランダム要素を完全排除。
3. **Decoupled Responsibilities**:
   - Assignment Runtime: Queue Item を生成
   - Scheduler: Status を `READY` に変更
   - Execution Runtime: `READY` アイテムをポップし実行・`COMPLETED` / `FAILED` へ更新
   - Workflow Runtime: Queue を参照し依存関係を制御
