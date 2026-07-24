# AI Task Evidence Standard v1.0 (Generation 9 Phase 2-4)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Task Evidence の定義
本仕様書は、AIOS Generation 9（AI Company）において、AI社員がタスクを遂行・検証する過程で取得される品質証跡を規定する **AI Task Evidence Standard v1.0** の仕様書である。

Generation 9 において、Evidence（証跡）とは**「タスクの検証結果、実行ログ、ハッシュ値、および承認状態を偽造不可能な形で証明する客観的成果データ」**である。

### 1.2 設計原則: Evidence Is Immutable Principle
本仕様は、AI Company の新たな品質原則 **`Evidence Is Immutable Principle`（証跡不可変原則）** に完全準拠する。

- **非上書き・改ざん不可原則**: 一度生成・記録された Evidence は永久に変更・上書き・削除してはならない。
- **追記専用モデル (Append-Only Model)**: 万が一、以前の検証結果の誤りや追加検証が発生した場合は、元の Evidence を修正せず、新しい `evidenceId` を持つ別の Evidence を追加記録（Append）しなければならない。

---

## 2. Evidence タイプ分類 (Evidence Types)

Task Evidence は、その取得源と検証内容に応じて以下の標準タイプに分類される。

| 種別コード (Type) | 定義と概要 |
|---|---|
| `SCHEMA_VALIDATION` | JSON Schema や構文チェックによるデータ構造の整合性検証ログ。 |
| `AUTOMATED_TEST` | 自動テストスイート（Pre-Commit Hook, Unit/Integration Test）の実行報告。 |
| `HASH_VERIFICATION` | SHA-256 チェックサム比較によるファイル・成果物の非改ざん性証明。 |
| `LOG_OUTPUT` | 処理の過程で出力されたシステム実行ログおよびコンソール出力結果。 |
| `HUMAN_APPROVAL` | CEO（人間）による `Proceed` または `APPROVED` 判定の明示的記録。 |
| `SYSTEM_METRICS` | 実行時間、ファイルサイズ、リソース使用量等の定量メトリクス。 |

---

## 3. Evidence 属性構造とスキーマ (Schema Specification)

個々の Evidence 記録は、以下の標準属性を満たさなければならない。

| 項目名 | Data Type | Req/Opt | Purpose | Description |
|---|---|---|---|---|
| `specificationVersion` | `String` | **Required** | 仕様バージョン | 本仕様書の準拠バージョン（例: `"1.0"`）。 |
| `evidenceId` | `String` | **Required** | 証跡の一意識別子 | 全社内でユニークなエビデンスID（例: `EVD-20260724-001`）。 |
| `taskId` | `String` | **Required** | 対象タスクID | 証跡が属する Task の `taskId` 参照。 |
| `assignmentId` | `String` | Optional | 対象アサインメントID | 関連するアサインメントの `assignmentId` 参照。 |
| `type` | `String` | **Required** | 証跡の種別 | 第2章に定義された `Evidence Type`（例: `SCHEMA_VALIDATION`）。 |
| `verificationStatus` | `String` | **Required** | 検証合否結果 | `PASS`, `FAIL`, `WARNING` のいずれか。 |
| `hash` | `String` | **Required** | 証跡の改ざん防止ハッシュ | ペイロードから算出された SHA-256 ハッシュ値。 |
| `timestamp` | `String` | **Required** | 証跡の取得日時 | ISO 8601 形式のタイムスタンプ（例: `"2026-07-24T17:00:00Z"`）。 |
| `source` | `String` | **Required** | 証跡の取得元 | 証跡を生成したAI社員/ツール（例: `QA-001`, `Node Verification Runner`）。 |
| `payload` | `Object/String` | **Required** | 証跡の本文ログ | 実際に取得された検証結果ログ、チェックリスト、または要約。 |

---

## 4. 保持および非改ざん性ポリシー (Retention & Integrity Policy)

1. **SHA-256 改ざん検知 (Integrity Check)**:
   すべての Evidence は、その `payload` 内容から算出された SHA-256 チェックサム（`hash`）を保持し、第三者による改ざんをいつでも数学的に検知できる状態を維持する。
2. **永続保存 (Retention)**:
   Evidence はタスクが `Archived` 状態へ移行した後も歴史的監査ログ（Audit Trail）として永続的に保存される。

---

## 5. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P2-4）においては、以下の領域を厳格にスコープ外とする。

- **Report Model (P2-5)**: 完了報告書、総合評価（Evaluation）構造は含めない。
- **Performance / Learning / Promotion**: 社員の人事評価、学習記録、昇格データモデルは含めない。
- **Analytics / Ledger Code**: 集計ダッシュボードや監査台帳（Ledger）の動的コードは含めない。
