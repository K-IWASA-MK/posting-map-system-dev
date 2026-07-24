# AI Organization Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-014`  
**Title**: AI Organization Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (Enterprise AI Hierarchy, Supervisor Engine, DoA Governance)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、AIOS アーキテクチャの最高位統制レイヤーとして、全社組織識別子・5 階層構造（COMPANY → DIVISION → DEPARTMENT → TEAM → UNIT）・5 大組織役割（SUPERVISOR, LEADER, WORKER, OBSERVER, SYSTEM）・権限委譲 (DoA - Delegation of Authority) スコープ・組織ヘルス監視・Supervisor AI による自動監視・承認・介入プロトコル、ならびにマルチテナント拡張対応を規定する **`AI Organization Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、および運用手順を定める。

---

## 2. アーキテクチャ (Complete AIOS Governance Stack)

```
AI Organization Foundation (v1.0)
        │ ── Hierarchy / Roles / DoA / Supervisor AI / Health / Multi-Tenant
        ▼
AI Employee Communication Foundation (v1.0)
        │ ── Inter-Agent Messaging / Thread / RPC / DLQ
        ▼
AI Employee Assignment Foundation (v1.0)
        │ ── Task Identity / DAG / Strategy / Handoff / Recovery
        ▼
AI Employee Manager Foundation (v1.0)
        │ ── Identity / Capability / Health / OrgStructure
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

### 1. Organization Identity (不変組織識別子モデル)
`organizationId`, `organizationName`, `version`, `createdAt`

### 2. Organization Hierarchy Model (5 階層構造)
`COMPANY` → `DIVISION` → `DEPARTMENT` → `TEAM` → `UNIT`

### 3. Organization Role Model (5 大組織役割)
- `SUPERVISOR`: 監督・承認・介入権限を持つ上長 AI
- `LEADER`: チーム/工程リーダー AI
- `WORKER`: 実働エージェント AI
- `OBSERVER`: 監視・ロギング専用エージェント AI
- `SYSTEM`: プラットフォームシステム基盤

### 4. Delegation Scope (DoA 委譲粒度)
`TASK`, `EMPLOYEE`, `TEAM`, `DEPARTMENT`, `GLOBAL`

### 5. Organization Health (組織健全性モデル)
`NORMAL`, `WARNING`, `CRITICAL`

### 6. Organization Metrics (統制メトリクス)
`departmentCount`, `teamCount`, `supervisorCount`, `employeeCount`, `delegationCount`, `interventionCount`

### 7. Organization Audit (監査ログ連動)
`OrganizationCreated`, `DepartmentCreated`, `TeamCreated`, `SupervisorAssigned`, `AuthorityDelegated`, `AuthorityRevoked`

### 8. Organization Recovery (全社復旧手順)
1. **Restore Organization**: 組織トップノードの復元
2. **Restore Departments**: 全部門ノードの復元
3. **Restore Teams**: 全チームノードの復元
4. **Restore Supervisors**: 全 Supervisor 役割と DoA 委譲マップの全復元

### 9. Organization Policy (ガバナンスルール)
`MAX_TEAM_SIZE` (10), `MAX_DIRECT_REPORTS` (7), `MAX_DELEGATION_DEPTH` (3), `ALLOW_CROSS_TEAM_DELEGATION` (true)

### 10. Multi-Tenant Support (将来の複数組織拡張)
`Tenant` → `Company` → `Division` → `Department` → `Team`
