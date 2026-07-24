# AI Employee Manager Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-011`  
**Title**: AI Employee Manager Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (AI Employee Registration, Lifecycle, Capability & Governance)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、AIOS における「実行主体（Who）」である AI 社員（District Agent, Traffic Agent, Weather Agent, Monitoring Agent 等）の登録・識別子管理・ライフサイクル状態・能力（Capability）抽象化・タスク割当状態・ヘルスモデル・個別セッション・個別ガバナンス Policy、ならびに組織構造（Org Structure）を司る **`AI Employee Manager Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、および運用手順を定める。

---

## 2. アーキテクチャ (AI Organization Stack)

```
AI Organization Foundation
        │
        ▼
AI Employee Manager Foundation (v1.0)
        │ ── Identity / Lifecycle / Capability / Health / Session / Org Structure
        ▼
AI Employee Instance (Traffic, Weather, Monitoring Agent)
        │
        ▼
Browser Execution Stack
        ├─ Browser Scheduler Foundation (v1.0)
        ├─ Browser Worker Foundation (v1.0)
        ├─ Browser Runtime Foundation (v1.0)
        └─ Chrome (AI Employee Profile)
```

---

## 3. 10 大必須拡張モデル (Core Governance Models)

### 1. AIEmployeeIdentity (不変識別子モデル)
`employeeId`, `employeeName`, `employeeType`, `version`, `createdAt`

### 2. Capability Provider (能力抽出インターフェース)
`IBrowserCapability`, `IMapCapability`, `ILineCapability`, `IWeatherCapability`

### 3. Assignment Status (タスク割当状態)
`UNASSIGNED`, `ASSIGNED`, `EXECUTING`, `BLOCKED`, `COMPLETED`

### 4. Health Model (ヘルス監視モデル)
`NORMAL`, `WARNING`, `CRITICAL`, `OFFLINE`

### 5. Employee Session (実行セッション)
`sessionId`, `startedAt`, `browserSessionId`, `currentTaskId`

### 6. Employee Policy (個別運用ルール)
`MAX_CONCURRENT_TASKS` (1), `MAX_BROWSER_SESSIONS` (1), `ALLOW_BACKGROUND_TASKS` (true), `ALLOW_HUMAN_AUTH` (true)

### 7. Employee Events (ライフサイクルイベント)
`EmployeeRegistered`, `EmployeeProvisioned`, `EmployeeStarted`, `EmployeePaused`, `EmployeeRetired`, `EmployeeHealthChanged`

### 8. Employee Audit (変更監査)
`EmployeeCreated`, `EmployeeDeleted`, `CompetencyChanged`, `PolicyChanged`, `AssignmentChanged`

### 9. Employee Recovery (自己修復復旧)
1. **Restart Employee**: AI 社員のセッションとメモリを安全再起動
2. **Reconnect Browser**: Browser Runtime セッションへ再バインド
3. **Restore Tasks**: 割り当て中タスクの状態を復元
4. **Resume Scheduler**: Browser Scheduler ジョブの実行を再開

### 10. Future Org Structure (将来の組織構造)
`departmentId`, `teamId`, `supervisorId`, `priorityGroup` による部門（Monitoring Team, Media Team 等）グルーピング。
