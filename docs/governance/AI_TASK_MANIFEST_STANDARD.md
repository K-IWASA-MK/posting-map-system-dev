# AI Task Manifest Standard v1.0 (Generation 9 Phase 2-2)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 にあつづける Task Manifest
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が遂行する業務（Task）の属性構造およびデータフォーマットを規定する **AI Task Manifest Standard v1.0** の仕様書である。

本仕様は `TASK_STANDARD.md`（P2-1）で定義された概念に基づき、Task の実体となる `TASK.json` マニフェストの機械判読可能なデータスキーマを定義する。

### 1.2 設計原則 (Design Principles)
1. **Deterministic Schema**: Task の目的・境界・制約が曖昧さなく表現され、自動検証可能であること。
2. **Single Responsibility**: 本マニフェストは「タスクの目的と境界」のみを表現し、割り当て（Assignment）・証跡（Evidence）・報告（Report）を混同・内包しない。
3. **Foundation Compliance**: 第6基本原則 `Separation of Foundation Principle` に従い、基盤層（Employee, Organization, Governance）に依存するが一元基盤化しない。

---

## 2. TASK.json スキーマ仕様 (Schema Specification)

AI社員が受領する個々の `TASK.json` ファイルは、以下のスキーマ属性に従わなければならない。

| 項目名 | Data Type | Req/Opt | Purpose | Description |
|---|---|---|---|---|
| `specificationVersion` | `String` | **Required** | マニフェスト仕様バージョン | 本仕様書の準拠バージョン（例: `"1.0"`）。 |
| `taskId` | `String` | **Required** | タスクの一意識別子 | 全社内でユニークなID（例: `TASK-20260724-001`）。 |
| `taskCode` | `String` | **Required** | 業務識別コード | ログや要約表示用のショートコード（例: `TSK-QA-DEPLOY-VERIFY`）。 |
| `name` | `String` | **Required** | タスクの名称 | タスクの簡潔なタイトル（例: `GitHub Pages 配信パス検証`）。 |
| `status` | `String` | **Required** | 現在のライフサイクル状態 | `TASK_STANDARD.md` に定義された 7 状態（`Created`, `Assigned`, `Accepted`, `In Progress`, `Verification`, `Completed`, `Archived`）。 |
| `version` | `String` | **Required** | タスク定義バージョン | 該当タスクマニフェストのバージョン（例: `"1.0.0"`）。 |
| `objective` | `Object` | **Required** | タスクの目的情報 | 達成すべき定性的・定量的ゴールの記述構造。 |
| `objective.summary` | `String` | **Required** | 目的の要約 | ゴールの簡潔な説明。 |
| `objective.deliverables` | `Array<String>` | **Required** | 期待される成果物リスト | 生成・提出すべきファイルパスや報告書のリスト。 |
| `scope` | `Object` | **Required** | タスクの動作境界 | 処理が許可される領域の制限構造。 |
| `scope.allowedPaths` | `Array<String>` | **Required** | 変更・参照許可パス | タスクがアクセスできるディレクトリ・ファイルのリスト。 |
| `scope.domainScope` | `String` | **Required** | 適用ドメイン | タスクが属する業務領域（例: `posting-map`, `platform-governance`）。 |
| `constraints` | `Object` | **Required** | 制約および承認条件 | タスク遂行における制限および必須承認条件。 |
| `constraints.prohibitedActions` | `Array<String>` | **Required** | 明示的禁止行動 | タスク遂行中に行ってはならない行動のリスト。 |
| `constraints.requiredApprovals` | `Array<String>` | **Required** | 必須承認ゲート | 実行前に人間の `Proceed` 承認が必要な操作のリスト。 |
| `createdAt` | `String` | **Required** | タスク発行日時 | ISO 8601 形式のタイムスタンプ（例: `"2026-07-24T16:55:00Z"`）。 |

---

## 3. マニフェスト構成例 (JSON Representation Example)

以下は `AI Task Manifest Standard v1.0` に準拠した標準的な `TASK.json` の構造例である。

```json
{
  "specificationVersion": "1.0",
  "taskId": "TASK-20260724-001",
  "taskCode": "TSK-QA-DEPLOY-VERIFY",
  "name": "GitHub Pages 配信パス整合性検証",
  "status": "Created",
  "version": "1.0.0",
  "objective": {
    "summary": "GitHub Pagesで公開されているフロントエンド資産が、Gitリポジトリの最新版と一致しているかを検証する",
    "deliverables": [
      "docs/audits/REPOSITORY_PUBLISHED_DIFF.md",
      "logs/verification_report.json"
    ]
  },
  "scope": {
    "allowedPaths": [
      "index.html",
      "projects/posting-map/",
      "docs/audits/"
    ],
    "domainScope": "posting-map"
  },
  "constraints": {
    "prohibitedActions": [
      "EXECUTE_GIT_PUSH_WITHOUT_APPROVAL",
      "MODIFY_PRODUCTION_BRANCH_DIRECTORY"
    ],
    "requiredApprovals": [
      "DEPLOYMENT_APPROVAL"
    ]
  },
  "createdAt": "2026-07-24T16:55:00Z"
}
```

---

## 4. 範囲外事項 (Scope Exclusion)

本スプリント（P2-2）においては、以下の領域を意識的にスコープ外とする。

- **Assignment Model (P2-3)**: 社員 (`employeeId`) への割当、優先度（Priority）、期限（Deadline）は含めない。
- **Evidence Model (P2-4)**: 検証結果ログ、ハッシュ値、テストエビデンスは含めない。
- **Report Model (P2-5)**: 完了報告書、評価（Evaluation）構造は含めない。
- **Queue / Scheduler**: 自動割り当て・タスクキュー制御処理は含めない。
