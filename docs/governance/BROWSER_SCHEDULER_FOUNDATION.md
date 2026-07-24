# Browser Scheduler Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-010`  
**Title**: Browser Scheduler Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (24/7 Time-Based Job Automation & Human Auth Boundary)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、`Browser Runtime Foundation v1.0` および `Browser Worker Foundation v1.0` の上位レイヤーとして、24 時間 365 日の自動実行（Cron / Interval）、定常ジョブ（Health Check, Cookie Refresh, Traffic Monitor 等）、ならびに人間認証境界（`Human Authentication Boundary`）に基づく **`WAITING_HUMAN_AUTH`** 自律待機・CEO 通知・自動再開・耐障害リカバリを司る **`Browser Scheduler Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、および運用手順を定める。

---

## 2. 全体アーキテクチャ (Browser Execution Stack)

```
Browser Scheduler Foundation
        │
        ├─ Cron / Interval (Job Engine)
        ├─ Human Authentication Boundary (WAITING_HUMAN_AUTH)
        ├─ Resume Policy (RESUME_FROM_WAIT / RESTART_TASK)
        └─ Job Persistence & Failure Recovery
                │
                ▼
Browser Worker Foundation
        │
        ├─ Queue (Fair Scheduler / Aging)
        ├─ LockScope (GLOBAL/PAGE/TAB/PROFILE)
        ├─ Dispatcher & Worker Isolation
                │
                ▼
Browser Runtime Foundation
        │
        ├─ CDP Connection
        ├─ Profile Isolation (AI Employee Profile)
        ├─ Session Verification (LINE / Google)
        └─ Runtime Evidence Package
                │
                ▼
Chrome (AI Employee Profile)
```

---

## 3. 10 大必須拡張モデル (Core Governance Models)

### 1. Scheduler Policy (スケジューラガバナンスルール)
`MAX_CONCURRENT_JOBS` (5), `MAX_RUNNING_TIME_MS` (300000), `MISSED_JOB_POLICY` (`EXECUTE_IMMEDIATELY`), `AUTH_WAIT_TIMEOUT_MS` (86400000 / 24時間), `HEALTH_CHECK_INTERVAL_MS` (60000 / 1分)

### 2. HumanAuthRequest Model (人間認証要求モデル)
`requestId`, `reason`, `provider`, `createdAt`, `status` (`PENDING`, `COMPLETED`, `EXPIRED`, `CANCELLED`), `requiredAction`, `expiresAt`, `completedAt`

### 3. Authentication Provider (認証プロバイダー抽象化)
`LINE`, `GOOGLE`, `CUSTOM_SERVICE`

### 4. Resume Policy (認証完了後の再開方針)
- `RESUME_FROM_WAIT`: 一時停止した位置から継続
- `RESTART_TASK`: 該当タスクの最初から再実行
- `RESTART_JOB`: 一連のジョブ全体を最初から再実行

### 5. Notification Channel (通知宛先抽象化)
`ConsoleNotificationChannel`, `DesktopNotificationChannel`, `SlackNotificationChannel`, `LINENotificationChannel`, `EmailNotificationChannel`

### 6. Job Persistence (ジョブ & 状態永続化)
プロセス再起動・クラッシュに備え、ジョブ定義、スケジュール状態、`WAITING_HUMAN_AUTH` 状態を JSON ファイルへ不変永続化。

### 7. Scheduler Metrics (監視項目)
`runningJobs`, `waitingJobs`, `pausedJobs`, `authWaitingJobs`, `missedJobs`, `resumeCount`, `averageTriggerDelayMs`

### 8. Scheduler Events (ライフサイクルイベント)
`SchedulerStarted`, `SchedulerStopped`, `SchedulerPaused`, `SchedulerResumed`

### 9. Authentication Audit (認証監査)
`HumanAuthRequested`, `HumanAuthCompleted`, `HumanAuthTimeout`, `HumanAuthCancelled`

### 10. Recovery Strategy (耐障害復旧手順)
1. **Scheduler Restart**: プロセス復旧時にスケジューラを自動再起動
2. **Reconnect Browser Runtime**: 既存の CDP ブラウザセッションへ再接続
3. **Restore Waiting Tasks**: 永続化ストアから `WAITING_HUMAN_AUTH` タスクを全復元
4. **Resume Jobs**: スケジュールおよび待機中タスクの実行を自動再開
