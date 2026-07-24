# Browser Worker Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-009`  
**Title**: Browser Worker Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (Multi-Agent Browser OS Arbitration)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、`Browser Runtime Foundation v1.0` の上位レイヤーとして、複数の AI 社員（Traffic Agent, Weather Agent, District Agent 等）からのブラウザ操作要求を調停し、優先度制御・ロック排他制御・餓死防止（Aging）・エージェント間障害遮断（Worker Isolation）・キャンセル制御を行う **`Browser Worker Foundation`** のアーキテクチャ、コンポーネント構造、規則、および型定義を定める。

---

## 2. アーキテクチャ (Browser Worker Architecture)

```
[Agent A (Traffic)]  [Agent B (Weather)]  [Agent C (District)]
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │ (Enqueue Task with Retry & Scope)
                               ▼
               [BrowserTaskQueue (Fair Scheduler)]
                               │ (Aging & Starvation Prevention)
                               ▼
                   [BrowserWorkerDispatcher]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [BrowserLockManager]             [WorkerIsolationManager]
  (Scope: GLOBAL/PAGE/TAB/PROFILE)      (Prevent Cascade Failures)
               │                               │
               └───────────────┬───────────────┘
                               │
                               ▼
                   [BrowserRuntime (v1.0)]
                               │
                               ▼
                   [BrowserWorkerMetrics]
```

---

## 3. 10 大必須拡張モデル (Core Governance Models)

### 1. BrowserTaskState (統一タスク状態)
`QUEUED` → `WAITING_FOR_LOCK` → `RUNNING` → `COMPLETED` (`FAILED`, `CANCELLED`, `TIMEOUT`)

### 2. Lock Scope (ロック粒度設定)
- `GLOBAL_BROWSER`: ブラウザ全体の排他ロック
- `BROWSER_CONTEXT`: コンテキスト単位の排他
- `PROFILE`: プロファイル単位の排他
- `PAGE`: ページ単位の排他
- `TAB`: タブ単位の排他

### 3. Fair Scheduling Policy (公平スケジューラ)
優先度 (`HIGH`, `NORMAL`, `BACKGROUND`) に加え、キュー滞留時間に応じたスコア加算 (`Aging`) および 餓死防止 (`Starvation Prevention`) を自動適用。

### 4. BrowserWorkerMetrics (Worker 専用メトリクス)
`queueLength`, `averageWaitTimeMs`, `averageExecutionTimeMs`, `lockContentionCount`, `timeoutCount`, `retryCount`, `deadlockRecoveryCount`

### 5. Worker Events (Event Bus 連動)
`TaskQueued`, `TaskStarted`, `TaskCompleted`, `TaskFailed`, `LockAcquired`, `LockReleased`, `TaskTimedOut`, `DeadlockRecovered`

### 6. Retry Policy (再試行ポリシー)
`NO_RETRY`, `RETRY_1`, `RETRY_3`, `EXPONENTIAL_BACKOFF`

### 7. Cancellation API (キャンセル API)
`cancelTask(taskId)`, `cancelAll()`, `cancelAgentTasks(agentId)`

### 8. Worker Isolation (エージェント間障害遮断)
1つの AI 社員タスクの例外・クラッシュが他の AI 社員のキューやブラウザ実行へ伝播・影響しないサンドボックス保護。

### 9. Worker Policy (ガバナンスルール)
`MAX_QUEUE_SIZE` (100), `MAX_EXECUTION_TIME_MS` (60000), `MAX_LOCK_TIME_MS` (30000), `MAX_RETRY_COUNT` (3)

### 10. Browser Pool Prep (Gen 10 拡張構造)
将来の複数ブラウザプール連携抽象インターフェース `IBrowserPoolRouter` を配備。
