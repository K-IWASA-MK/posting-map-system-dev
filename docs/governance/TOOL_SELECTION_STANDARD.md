# Tool Selection Standard v1.0 (Generation 9 Phase 3-2)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Tool Selection
本仕様書は、AIOS Generation 9（AI Company）において、AI社員がタスク（Task）を遂行する際に、必要な能力（Capability）を判別し、最適な道具（Tools）を決定論的に選択するロジックを規定する **Tool Selection Standard v1.0** の仕様書である。

本仕様は、第7基本原則 `Tool Is Capability Principle` を運用レベルで具現化し、ツール名の直接指定ではなく能力ベースの動的・安全なツールマッピングを実現する。

### 1.2 コア設計原則: Capability Before Tool Principle
本仕様は、AI Company の新たな能力選定原則 **`Capability Before Tool Principle`（能力先行選定原則）** に完全準拠する。

```
 [1. Task Requirements] ──► [2. Required Capability] ──► [3. Candidate Tools] ──► [4. Selected Tool]
```

- **能力起点による選定**: AI社員は「ツール名（例: Git, Chrome）」から直接選択を開始してはならない。まずタスクの目的と制約から必要な「能力（Capability）」を特定し、その能力要件を満たすツール群（Candidate Tools）の中から最適なものを選択しなければならない。

---

## 2. ツール選定ポリシーとマッチング規則 (Selection Policy & Matching)

### 2.1 ツール選択手順 (4-Step Selection Process)

1. **Capability Identification (能力特定)**:
   Task Manifest の `objective` および `scope` から、必要な業務能力（例: `VersionControlCapability`, `BrowserInspectionCapability`）を抽出する。
2. **Employee Skill Verification (社員能力照合)**:
   自身の `EMPLOYEE.json` に定義された `skills` および `availableTools` の範囲内にあるかを確認する。
3. **Candidate Evaluation (候補ツール評価)**:
   必要な能力を提供するツール群の中から、アクセス権限およびリスクレベルを満たす候補を絞り込む。
4. **Tool Commitment (ツール確定)**:
   使用するツールを確定し、実行イベントログに `ToolSelectedEvent` として記録する。

---

## 3. フォールバック方針 (Fallback Policy)

プライマリツールが利用不可能（APIダウン、環境非対応、認証切れ等）である場合、AI社員は以下のフォールバック規律に従わなければならない。

1. **代替ツールの自動探索**: 同一 Capability を提供する代替ツールが存在する場合、自動的にフォールバックツールへと切り替える。
2. **フォールバック不可時の安全停止**: 同一 Capability を満たす代替ツールが存在しない場合、勝手に未知のコマンドを実行せず、状態を `Execution Suspended` へ変更して人間（CEO）へ通知する。

---

## 4. 人間承認必須条件 (Human Approval Conditions)

以下のリスクを伴うツール操作・選択を行う場合は、ツール実行前に必ず人間（CEO）の `Proceed` 承認を獲得しなければならない。

- リポジトリの公開ブランチへのプッシュ・書き込み操作（`Git Write/Push`）
- 本番環境・データベースの更新・削除操作（`Database Mutate/Delete`）
- 決済・ライセンス契約変更操作（`Billing Mutation`）
- 外部未知ドメインへの非公開データ送信（`External Data Transmission`）

---

## 5. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P3-2）においては、以下の領域を厳格にスコープ外とする。

- **Tool Registry Implementation**: Tool Registry のプログラムコードやデータストア実装は含めない（バックログとして管理）。
- **Tool Operation Code**: Chrome, Git, GAS, Python, Playwright 等の具体的な自動化スクリプトロジックは含めない。
- **Execution Log Engine**: ログ収集エンジンの実装は含めない。
