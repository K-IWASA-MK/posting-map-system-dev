# Employee Lifecycle Standard v1.0 (Generation 9 Phase 5-1)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Employee Lifecycle
本仕様書は、AIOS Generation 9（AI Company）において、AI社員（AI Employee）の誕生（オンボーディング）から配属、一時休止、復職、および退職（リタイアメント）に至る全生存期間の状態遷移とメタデータを規定する **Employee Lifecycle Standard v1.0** の仕様書である。

本仕様は、AI社員の「存在状態（Lifecycle State）」を標準化し、不正な状態変更や暗黙の消失を防止する。

### 1.2 コア設計原則: Lifecycle Changes Require Explicit State Transitions Principle
本仕様は、AI Company の新たなライフサイクル原則 **`Lifecycle Changes Require Explicit State Transitions Principle`（明示的ライフサイクル遷移原則）** に完全準拠する。

```
 [CANDIDATE] ──(Onboard)──► [ACTIVE] ──(Suspend)──► [SUSPENDED]
                              │                        │
                              ▼                        ▼
                        (Retire/Deact)────────────► [RETIRED]
```

- **明示的状態遷移の義務付け**: AI社員の状態は定義済みのライフサイクル遷移ルールによってのみ変更できる。状態変更は明示的な遷移イベント・理由を伴い、暗黙的または直接的なデータ書き換えを行ってはならない。

---

## 2. ライフサイクル状態定義 (Lifecycle States)

AI社員は、生存期間中に以下の 4 つの確定的なライフサイクル状態のいずれかを保持しなければならない。

| 状態名 | Description | 実行権限・動作 |
|---|---|---|
| `CANDIDATE` | 候補・オンボーディング中。スキル登録やIdentity検証の準備段階。 | タスク実行不可。システム検証のみ可能。 |
| `ACTIVE` | 正式配属・稼働中。通常業務・タスクアサインが可能な状態。 | 全タスク実行、ツール選択、部門間協調が可能。 |
| `SUSPENDED` | 一時停止・休職中。メンテナンス、セキュリティ監査、または障害調査中。 | 新規タスクアサイン不可。進行中セッション保護。 |
| `RETIRED` | 退職・退役。組織からの抹消・アーカイブ状態。 | 全実行不可。過去エビデンス・ログのみ保存。 |

---

## 3. 状態遷移ルールとトリガー (State Transition Rules & Metadata)

### 3.1 状態遷移ルール (State Transition Matrix)
1. `CANDIDATE` → `ACTIVE`: オンボーディング検証（Identity Check, Skills Register）合格時。
2. `ACTIVE` → `SUSPENDED`: セキュリティ検知、システム整備、または人間による介入命令時。
3. `SUSPENDED` → `ACTIVE`: 監査クリア、人間による復職承認（Human Override Resolution）時。
4. `ACTIVE` / `SUSPENDED` → `RETIRED`: モデル廃止、役割終了、または人間による退役命令時。

### 3.2 ライフサイクルメタデータ構造 (Lifecycle Metadata Schema)

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `employeeId` | `String` | **Required** | 対象 AI社員ID（例: `EMP-DIST-INIT-01`）。 |
| `currentLifecycleState` | `String` | **Required** | 現在のライフサイクル状態。 |
| `previousLifecycleState` | `String` | Optional | 遷移前のライフサイクル状態。 |
| `lastTransitionTimestamp` | `String` | **Required** | 最終状態遷移日時（ISO 8601 形式）。 |
| `transitionReason` | `String` | **Required** | 状態遷移の理由要約。 |
| `authorizedBy` | `String` | **Required** | 承認主（`HUMAN_CEO`, `GOVERNANCE_SYSTEM` 等）。 |

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P5-1）においては、以下の領域を厳格にスコープ外とする。

- **Performance Evaluation**: パフォーマンス評価・実績採点は含めない（P5-2の責務）。
- **Learning & Promotion**: 学習・昇格・異動標準は含めない（P5-3の責務）。
- **Company Audit**: 全社監査仕様は含めない（P5-4の責務）。
- **Organization Governance**: 最高全社ガバナンスは含めない（P5-5の責務）。
