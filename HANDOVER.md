# AIOS Platform Development Handover (AIOS Core)

次回の担当AIへ。以下のコンテキストを読み込み、開発ルールと現在地を確認して作業を開始してください。

---

## 📍 1. Current Location (現在地)

- **Platform**: `CIE Platform v2.3.0-alpha.0`
- **Completed**: `POSTING MAP Product Sprint 1 Phase S1-5: Dashboard Map Intelligence Foundation`
- **Milestone**: `AIOS Runtime Foundation Milestone 1 & Sprint 1 Phase S1-5 COMPLETED`
- **Tag**: `v4.45-sprint-1-phase-s1-5-completed`
- **Current Phase**: `Sprint 1 Phase S1-6`
- **Next Action**: `Phase S1-6 (Dashboard MVP Integration)`
- **Branch**: `main`

---

## ⚙️ 2. Development Rules (開発ルール)

次の担当AIが確実に順守すべき開発プロセス・ポリシーです。

- **Foundation First**: 常に基盤の整合性と動作保証を最優先とする。
- **Implementation Plan Required**: 実装前に必ず実行計画を作成・提示する。
- **Review Required**: 実装・変更の開始には必ず岩佐CEOの承認（GO）を得る。
- **One Responsibility per Step**: 1ステップにつき1つの責務のみを実装・更新する。
- **Verify Required**: コミット前に必ず健全性検証を実行する。
- **Git Commit Required**: 正常動作を確認した段階でローカルコミットを行う。
- **Git Push Policy**: The AI may perform Git Push after the approved implementation workflow, subject to the configured Review Policy.
- **Milestone Audit**: 節目のフェーズ（Phase 100 / 200 / 300）到達時は、Foundation Audit、サードパーティレビュー、および Fix Pack による全体品質の引き締めを実施する。

---

## 🤖 3. AIOS Standard Communication Specification (ASCS)

- **Version**: `ASCS v1.0`
- **Purpose**: Standard communication protocol for AI-to-AI / AI-to-Human collaboration.
- **Scope**: Applies to all AIOS development projects and environments.

### Requirements (通信規約)
- **Single Code Block Rule**: 回答は必ず1つのマークダウンコードブロックのみで提出すること。コードブロック外への文章・補足・説明・前置き・あとがきは例外なく一切禁止する。
- **Output Rule**: 回答は追加説明が不要な完成版のみを出力し、途中でユーザーへの追加説明の要求や質問を行わないこと。
- **Copy Safe Rule**: すべての回答は GPT ➔ User ➔ Flash ➔ Claude ➔ Gemini などの AI 間でコピー＆ペーストされることを前提として作成し、途中でコンテキストや情報が欠落する構成は禁止する。

---

## 📞 4. AI Communication Rules (協調規約)

AIOS 開発エージェント間で引き継ぎされるべき通信・作業の前提条件です。

- 回答は実装可能な完成版のみを提出し、そのまま採用・実行可能なコードや計画を提示すること。
- 過去に合意した Development Rules を確実に継承して引き継ぐこと。

---

## 🗺️ 5. Roadmap (ロードマップ)

- **Foundation** (Phase1-90) ✅
- **Execution Runtime** (Phase91-120)
- **Execution Engine** (Phase121-180)
- **Distributed Runtime** (Phase181-240)
- **AIOS Core** (Phase241-300)

---

## 📦 6. Git Information

- **Latest Commit**: Use `git log -1` to check the current HEAD commit details.
- **Commit History**: Keep only the latest 5 commits. (Older history should be retrieved using `git log`.)

---

## 🚀 Startup Checklist

Before starting development:

1. Read Current Location
2. Create Implementation Plan
3. Review & Approval (GO)
4. Implementation
5. Verify (CIE verify)
6. Doctor (CIE doctor)
7. pytest
8. HANDOVER.md Update
9. Git Commit
10. Git Push (Subject to Review Policy)
11. Completion Report (Verify Commit Hash, Verify/Doctor PASS, pytest PASS, HANDOVER updated, Push completed, Working Tree Clean)


---

## 7. Branding & Design System Consensus (ブランド設計確定)

- **正式ブランド名**: `POSTING MAP` (スマートフォンWebアプリ / PC管理画面 `POSTING MAP Dashboard`)
- **開発コードネームの排除**: `H-App` / `Hアプリ` / `管理者アプリ` などの開発ネームはユーザー向けには一切使用しない。
- **保存先 (SSOT)**: 
  - [docs/gpt-memory/BRANDING.md](file:///Volumes/SSD_DATA/posting-map-system/docs/gpt-memory/BRANDING.md)
  - [AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md)（Brand Identityセクション）
- 今後のUI設計・営業資料・マニュアル・実装は本決定に厳密に従うこと。

---

## 8. Architecture Milestones (アーキテクチャマイルストーン)

| Milestone | Phase Range | Tag | Status | Date |
| :--- | :--- | :--- | :--- | :--- |
| Execution Runtime Foundation | Phase 206 – 229 | `v4.31-runtime-foundation` | ✅ Completed | 2026-07-10 |
| Runtime Boot Foundation | Phase 216 | - | ✅ Completed | 2026-07-10 |
| Runtime Orchestrator Foundation | Phase 217 | - | ✅ Completed | 2026-07-10 |
| Runtime Execution Pipeline Foundation | Phase 218 | - | ✅ Completed | 2026-07-10 |
| Runtime Context Manager Foundation | Phase 219 | - | ✅ Completed | 2026-07-10 |
| Runtime State Manager Foundation | Phase 220 | - | ✅ Completed | 2026-07-10 |
| Runtime Session Manager Foundation | Phase 221 | - | ✅ Completed | 2026-07-10 |
| Runtime Instance Blueprint Foundation | Phase 222 | - | ✅ Completed | 2026-07-10 |
| Runtime Loader Foundation | Phase 223 | - | ✅ Completed | 2026-07-10 |
| Runtime Builder Foundation | Phase 224 | - | ✅ Completed | 2026-07-10 |
| Runtime Composer Foundation | Phase 225 | - | ✅ Completed | 2026-07-10 |
| Runtime Executor Foundation | Phase 226 | - | ✅ Completed | 2026-07-10 |
| Runtime Engine Foundation | Phase 227 | - | ✅ Completed | 2026-07-10 |
| Runtime Blueprint Interpreter Foundation | Phase 228 | - | ✅ Completed | 2026-07-10 |
| Runtime Kernel Foundation | Phase 229 | - | ✅ Completed | 2026-07-10 |
| Runtime Kernel Engine Foundation | Phase 230 | - | ✅ Completed | 2026-07-10 |
| Runtime Thread Foundation | Phase 231 | - | ✅ Completed | 2026-07-10 |
| Runtime Scheduler Foundation | Phase 232 | - | ✅ Completed | 2026-07-10 |
| Runtime Queue Foundation | Phase 233 | - | ✅ Completed | 2026-07-10 |
| Runtime Task Foundation | Phase 234 | - | ✅ Completed | 2026-07-10 |
| Runtime Worker Foundation | Phase 235 | - | ✅ Completed | 2026-07-10 |
| Runtime Dispatcher Foundation | Phase 236 | - | ✅ Completed | 2026-07-10 |
| Runtime Event Foundation | Phase 237 | - | ✅ Completed | 2026-07-10 |
| Runtime Event Bus Foundation | Phase 238 | - | ✅ Completed | 2026-07-10 |
| Runtime Message Router Foundation | Phase 239 | - | ✅ Completed | 2026-07-10 |
| Runtime Transport Foundation | Phase 240 | - | ✅ Completed | 2026-07-10 |
| Runtime Connection Foundation | Phase 241 | - | ✅ Completed | 2026-07-10 |
| Runtime Protocol Foundation | Phase 242 | - | ✅ Completed | 2026-07-10 |
| Runtime Session Foundation | Phase 243 | - | ✅ Completed | 2026-07-10 |

---

### Runtime Foundation

Execution Runtime Foundation（Phase 206 ～ 229）完了。

Static Blueprint Foundation を凍結。

Dynamic Runtime Series は Phase 230 より開始。

Runtime Foundation Tag

```text
v4.31-runtime-foundation
```

### Runtime Kernel Engine Foundation

Runtime Kernel Engine Foundation（Phase 230）完了。

静的 Blueprint（Kernel Engine Schema）の策定、不変定義および検証テストを実装。

### Runtime Thread Foundation

Runtime Thread Foundation（Phase 231）完了。

静的 Blueprint（Thread Schema）の策定、不変定義、および検証テストを実装。

### Runtime Scheduler Foundation

Runtime Scheduler Foundation（Phase 232）完了。

静的 Blueprint（Scheduling Schema）の策定、不変定義（NO_PRIORITY_CALCULATION, NO_LOAD_BALANCING ポリシー追加）、および検証テストを実装。

### Runtime Queue Foundation

Runtime Queue Foundation（Phase 233）完了。

静的 Blueprint（Queue Schema）の策定、不変定義（NO_PRIORITY, NO_SORT, NO_REORDER ポリシーおよび supportedQueuePolicies、queueSchemaVersion 追加）、および検証テストを実装。

### Runtime Task Foundation

Runtime Task Foundation（Phase 234）完了。

静的 Blueprint（Task Schema）の策定、不変定義（TaskCapability, TaskDependencyPolicy, supportedTaskPolicies, taskSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Worker Foundation

Runtime Worker Foundation（Phase 235）完了。

静的 Blueprint（Worker Schema）の策定、不変定義（WorkerCapability, WorkerDependencyPolicy, supportedWorkerPolicies, workerSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Dispatcher Foundation

Runtime Dispatcher Foundation（Phase 236）完了。

静的 Blueprint（Dispatch Schema）の策定、不変定義（DispatcherCapability, DispatcherExecutionPolicy, DispatcherDependencyPolicy, dispatcherSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Event Foundation

Runtime Event Foundation（Phase 237）完了。

静的 Blueprint（Event Schema）の策定、不変定義（EventCategory, EventDirection, EventPriorityPolicy, supportedCapabilities, supportedEventPolicies, eventSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Event Bus Foundation

Runtime Event Bus Foundation（Phase 238）完了。

静的 Blueprint（Event Bus Schema）の策定、不変定義（EventBusTopology, EventBusDeliveryPolicy, EventBusReliabilityPolicy, EventBusCategory, EventBusChannelPolicy, eventBusSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Message Router Foundation

Runtime Message Router Foundation（Phase 239）完了。

静的 Blueprint（Message Router Schema）の策定、不変定義（RouterTopology, RouterReliabilityPolicy, RouterCategory, RouterSelectionPolicy, RouterTransportPolicy, RouterSecurityPolicy, routerSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Transport Foundation

Runtime Transport Foundation（Phase 240）完了。

静的 Blueprint（Transport Schema）の策定、不変定義（TransportTopology, TransportReliabilityPolicy, TransportSecurityPolicy, TransportCategory, TransportProtocolPolicy, supportedConnectionPolicies, supportedProtocolPolicies, transportSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Connection Foundation

Runtime Connection Foundation（Phase 241）完了。

静的 Blueprint（Connection Schema）の策定、不変定義（ConnectionTopology, ConnectionSecurityPolicy, ConnectionStatePolicy, ConnectionDependencyPolicy, supportedAuthenticationPolicies, supportedConnectionModes, connectionSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Protocol Foundation

Runtime Protocol Foundation（Phase 242）完了。

静的 Blueprint（Protocol Schema）の策定、不変定義（ProtocolTopology, ProtocolSerializationPolicy, ProtocolVersionPolicy, ProtocolMessageFormatPolicy, ProtocolCompatibilityPolicy, ProtocolValidationPolicy, protocolSchemaVersion 等の追加）、および検証テスト（禁止命令コードの静的スキャナーを含む）を実装。

### Runtime Session Foundation

Runtime Session Foundation（Phase 243）完了。

静的 Blueprint（Session Schema）の策定、不変定義（SessionTopology, SessionSecurityPolicy, SessionStatePolicy, SessionTimeoutPolicy, SessionIsolationPolicy, SessionIdentityPolicy, supportedConnectionPolicies, supportedTransportPolicies, supportedProtocolPolicies, sessionSchemaVersion 等の追加）、および検証テスト（禁止命令コードおよび実行系クラスの静的スキャナーを含む）を実装。
次のフェーズ（Phase 244：Runtime Secure Channel Foundation）へ安全に移行可能。
