# AI Employee Communication Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-013`  
**Title**: AI Employee Communication Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Execution Infrastructure (Multi-Agent Inter-Employee Communication, RPC & DLQ)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、AIOS 上の複数の AI 社員（District Agent, Traffic Agent, Weather Agent, Monitoring Agent, Leader AI 等）が互いに構造化会話スレッド・配送状態トラッキング・マルチターン対話セッション・優先度・Dead Letter Queue (DLQ)・外部コネクタ抽象化に基づいて安全・確実に通信・協調処理を行う **`AI Employee Communication Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、および運用手順を定める。

---

## 2. アーキテクチャ (AI Multi-Agent Communication Stack)

```
AI Organization Layer (次世代)
        │
        ▼
AI Employee Communication Foundation (v1.0)
        │ ── Conversation Thread / Message Bus / Agent RPC / DLQ / Recovery
        ├───────────────────────────────┐
        ▼                               ▼
AI Employee Assignment Foundation     AI Employee Manager Foundation
  (What: Task Identity & Handoff)       (Who: Identity & Capability)
        │
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

### 1. Conversation / Thread Model (会話追跡モデル)
`conversationId`, `parentMessageId`, `threadId`

### 2. Delivery Status (メッセージ配送状態)
`CREATED`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `EXPIRED`

### 3. Communication Channel Scope (通信スコープ)
`DIRECT` (1対1), `TEAM` (チーム内), `DEPARTMENT` (部門内), `SYSTEM` (システム通知), `GLOBAL` (全社ブロードキャスト)

### 4. Message Priority (通信優先度)
`CRITICAL`, `HIGH`, `NORMAL`, `LOW`, `BACKGROUND`

### 5. Communication Session (多重対話セッション)
`sessionId`, `participants`, `startedAt`, `expiresAt`, `active`

### 6. Dead Letter Queue (未配送メッセージ隔離 DLQ)
配送失敗、タイムアウト、相手不在のメッセージを不変保持・手動/自動再送。

### 7. Communication Audit (監査ログ連動)
`MessageCreated`, `MessageSent`, `MessageDelivered`, `MessageRead`, `MessageExpired`, `RPCRequested`, `RPCResponded`

### 8. Communication Recovery (障害復旧手順)
1. **Reconnect Bus**: メッセージバスのソケット/接続を自動再確立
2. **Restore Pending RPC**: 未応答の RPC リクエストを不変ストアから復元
3. **Replay Events**: 直近の重要イベントを未受信エージェントへ再配信
4. **Resume Communication**: セッションと対話を自動再開

### 9. Communication Policy (ガバナンスルール)
`MAX_MESSAGE_SIZE` (64KB), `MAX_RPC_TIMEOUT_MS` (30000), `MAX_RETRY_COUNT` (3), `MAX_BROADCAST_TARGETS` (50)

### 10. Future External Connector (外部連携拡張)
`IExternalConnector` (Slack, LINE, Webhook, Email への外部通知拡張インターフェース)
