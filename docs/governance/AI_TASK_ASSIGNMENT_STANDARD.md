# AI Task Assignment Standard v1.0 (Generation 9 Phase 2-3)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Task Assignment
本仕様書は、AIOS Generation 9（AI Company）において、定義された仕事（Task）を特定の AI社員（Employee）または部署（Department）へ割り当てる仕組みを規定する **AI Task Assignment Standard v1.0** の仕様書である。

Generation 9 において、Task Assignment とは**「既存の Task と既存の Employee / Department を非破壊的な参照（Reference）によって結び付け、優先度（Priority）および期限（Deadline）を伴う実行責任を明示する独立レイヤー」**である。

### 1.2 コア設計原則: Assignment Is Reference Principle
本仕様は、AI Company の新たな設計原則 **`Assignment Is Reference Principle`（割り当て参照原則）** に完全準拠する。

```
 [Employee Identity (v2.0)] ─── (Reference Only) ───┐
                                                     ▼
 [Task Manifest (v1.0)]     ─── (Reference Only) ───► [Task Assignment Layer]
```

- **非所有・非破壊性**: Assignment は Task や Employee を所有せず、それらの定義ファイルを直接変更・上書きしない。
- **独立レイヤーの確保**: 割り当ての変更、担当者の交代、再割り当て（Reassignment）が発生した場合でも、Task および Employee のマニフェストは一切影響を受けず、参照関係の記述（Assignment Record）のみが更新される。

---

## 2. Assignment 属性構造とスキーマ (Schema Specification)

Task Assignment を表現するデータ構造は、以下の標準属性を満たさなければならない。

| 項目名 | Data Type | Req/Opt | Purpose | Description |
|---|---|---|---|---|
| `specificationVersion` | `String` | **Required** | 仕様バージョン | 本仕様書の準拠バージョン（例: `"1.0"`）。 |
| `assignmentId` | `String` | **Required** | 割当の一意識別子 | 全社内でユニークなアサインメントID（例: `ASN-20260724-001`）。 |
| `taskId` | `String` | **Required** | 対象タスクID | 割り当て対象となる Task の `taskId` 参照。 |
| `assignedEmployeeId` | `String` | Optional | 担当AI社員ID | タスクを直接遂行する担当AI社員の `employeeId`（例: `QA-001`）。 |
| `assignedDepartmentId` | `String` | **Required** | 担当部署ID | タスクの主轄部署となる `departmentId`（例: `DEPT-QA`）。 |
| `priority` | `String` | **Required** | タスクの優先度 | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` の 4 段階。 |
| `deadline` | `String` | Optional | タスクの完了期限 | ISO 8601 形式のタイムスタンプ（例: `"2026-07-25T18:00:00Z"`）。 |
| `assignedBy` | `String` | **Required** | 割当発行者 | アサインメントを発行した主体（例: `CEO-HUMAN`, `QA-HEAD-001`）。 |
| `assignedAt` | `String` | **Required** | 割当発行日時 | ISO 8601 形式のタイムスタンプ（例: `"2026-07-24T17:00:00Z"`）。 |

---

## 3. 優先度と期限の定義 (Priority & Deadline Standards)

### 3.1 優先度区分 (Priority Levels)
- **`CRITICAL` (緊急・最優先)**: システム障害復旧、本番公開ブロック解除等、即時対応が必要なタスク。
- **`HIGH` (高)**: 当日または直近スプリントの主要目標に直結するタスク。
- **`MEDIUM` (中)**: 通常の開発・検証スプリントの標準タスク。
- **`LOW` (低)**: リファクタリング、ドキュメント整備等、時間に余裕のあるタスク。

### 3.2 期限設定 (Deadline Rule)
- 期限（`deadline`）が設定されている場合、担当AI社員は該当刻限までに検証および報告（Verification & Completion Report）を提出する責務を負う。

---

## 4. アサインメント ライフサイクル (Assignment Lifecycle)

Task Assignment は、以下の状態遷移によって管理される。

```
 [Unassigned] → [Pending] → [Assigned] → [Accepted] → [Completed]
                               │            │
                               ▼            ▼
                         [Reassigned]   [Revoked]
```

- **Unassigned**: タスクが存在するが、割り当て先未決定。
- **Pending**: 割り当て案が作成され、上詞/CEOの承認待ち。
- **Assigned**: 正式に AI社員/部署へ割り当て完了。
- **Accepted**: 担当AI社員が受諾し、業務受領を確認。
- **Reassigned**: 担当者が変更され、別社員へ再割り当て。
- **Completed**: 業務が完了し、アサインメント責務が解除された状態。
- **Revoked**: 割り当てが取り消し・無効化された状態。

---

## 5. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P2-3）においては、以下の領域を厳格にスコープ外とする。

- **Evidence Model (P2-4)**: 検証結果ログ、テストエビデンス、ハッシュ値は含めない。
- **Report Model (P2-5)**: 完了報告書、評価（Evaluation）構造は含めない。
- **Task / Employee Mutation**: 既存の `EMPLOYEE.json` や `TASK.json` を直接変更・更新しない。
- **Queue / Scheduler / Execution**: 自動キューイングやスケジューラーロジックは含めない。
