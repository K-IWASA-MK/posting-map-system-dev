# AI Employee Assignment Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-012`  
**Title**: AI Employee Assignment Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (Task Identity, DAG Workflow, Handoff & Escalation Governance)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、`AI Employee Manager Foundation v1.0` で管理される AI 社員群に対し、ビジネス・ポスティング・メディアイベント等のタスクを不変識別子・依存グラフ（DAG）・優先度・所有権（Ownership）・ガバナンス Strategy に基づいて動的割り当て、バトンリレー引き継ぎ（Handoff）、および再割り当て（Re-assignment）を司る **`AI Employee Assignment Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、および運用手順を定める。

---

## 2. アーキテクチャ (AI Assignment Architecture)

```
AI Organization Foundation
        │
        ▼
AI Employee Assignment Foundation (v1.0)
        │ ── Task Identity / Dependency Graph / Handoff / Escalation
        ▼
AI Employee Manager Foundation (v1.0)
        │ ── Who (AI 社員登録・Identity・Capability)
        ▼
Browser Execution Stack (v1.0)
  ├─ Browser Scheduler Foundation (When: 24/7 Cron & Human Auth)
  ├─ Browser Worker Foundation (How Queue: LockScope & Isolation)
  └─ Browser Runtime Foundation (How Exec: CDP & Profile Isolation)
        │
        ▼
Chrome (AI Employee Profile)
```

---

## 3. 10 大必須拡張モデル (Core Governance Models)

### 1. Task Identity (不変タスク識別子モデル)
`taskId`, `taskType`, `createdAt`, `createdBy`, `version`

### 2. Task Dependency Graph (DAG 依存グラフ)
`parentTaskId`, `dependsOnTaskIds`, `isReadyToExecute()`

### 3. Assignment Strategy (割当アルゴリズム抽象化)
- `ROUND_ROBIN`: 順番割当
- `LEAST_LOADED`: 最小タスク数社員割当
- `BEST_CAPABILITY`: 最高 Capability 適合社員割当
- `HIGHEST_PRIORITY`: 最優先タスク即時割当

### 4. Task Ownership (所有者・担当者分離)
- `ownerEmployeeId`: タスク結果に最終責任を持つ所有者
- `currentEmployeeId`: 現在実働・バトン引き継ぎ中の担当者

### 5. Escalation Policy (滞留エスカレーション)
`WAIT`, `REASSIGN`, `ESCALATE_TO_SUPERVISOR`, `FAIL`

### 6. Task Priority Model (構造化優先度)
`CRITICAL`, `HIGH`, `NORMAL`, `LOW`, `BACKGROUND`

### 7. Assignment Audit (監査ログ連動)
`TaskCreated`, `TaskAssigned`, `TaskReassigned`, `TaskHandedOff`, `TaskCompleted`, `TaskFailed`

### 8. Assignment Recovery (障害復旧手順)
1. **Restore Task**: 未完タスクの定義と状態を永続化ストアから全復元
2. **Restore Owner**: 最終所有者（`ownerEmployeeId`）を復元
3. **Find Available Employee**: 利用可能な担当者（`currentEmployeeId`）を自動探索
4. **Resume**: タスクの実行およびバトンリレーを自動再開

### 9. Assignment Policy (ガバナンスルール)
`MAX_TASKS_PER_EMPLOYEE` (5), `MAX_HANDOFF_COUNT` (3), `MAX_REASSIGNMENT` (3), `ALLOW_CROSS_TEAM_ASSIGNMENT` (true)

### 10. Future Workflow Support (ワークフロー階層構造)
`Workflow` (大業務) → `Stage` (工程) → `Task` (個体タスク) → `Assignment` (割り当て)
