# Development OS Specification

## 1. Overview
Development OS は、AIOS (Advanced Agentic Operating System) 自身が自己のコードベースを開発、監査、検証、およびリリースするプロセスを自律的かつ安全に管理するためのOSレイヤーです。  
AIOS Architecture Charter（最高設計原則）に完全に準拠し、すべての開発ステップが決定論的かつ不変的に制御されることを保証します。

---

## 2. Architecture & Concept
Development OS は、直接的に開発ツール（Git, Shell, API 等）を実行するのではなく、それらを抽象化した Capability（能力）および Skill（技能）としてカプセル化し、不変な実行ログ（Ledger）に記録しながら段階的に実行する構造をとります。

```
[DevelopmentMode] -> 開発状態の追跡
      ↓
[DevelopmentRules] -> 許可ルール・Capability要件
      ↓
[CapabilityResolver] -> タスクから必要な抽象Capabilityの解決
      ↓
[SkillRegistry / Pipeline] -> Capability実現に必要な Skill の順序決定
      ↓
[ExecutionLedger] -> 実行計画とログの不変記録
      ↓
[QualityGate] -> 実行後コードの品質・レビュー基準チェック
```

---

## 3. Core Models & Modules

### 3.1 DevelopmentMode (開発ステート)
* **役割**: システム開発セッションの現在の動作状態（PLANNING, EXECUTING, TESTING 等）を表す。
* **不変性**: `Object.freeze` で凍結され、状態変更の際は常にオブジェクトが再作成される。

### 3.2 DevelopmentRules (開発ルール)
* **役割**: 開発時に適用されるポリシー（例: 「直接的な本番デプロイ禁止」、「ADR作成必須」など）。
* **項目**: `ruleId`, `ruleName`, `capability` (必要なCapability要件), `priority`。

### 3.3 Capability (抽象能力境界)
* **定義**: 開発タスクに必要な抽象的な能力。Tool寄り（`READ_FILE`, `WRITE_FILE`）ではなく、目的寄り（「何をしたいか」）の抽象化レベルで定義する。
* **標準定義名**:
  * `Architecture`: システム構造設計、アーキテクチャ定義
  * `Planning`: 実装計画の策定
  * `Implementation`: ソースコードの実装・編集
  * `Testing`: テストコード実行、検証
  * `Review`: コードレビュー、整合性確認
  * `Debugging`: 不具合修正、デバッグ
  * `Documentation`: 仕様書・記録作成
  * `Release`: バージョンタグ適用、リリース

### 3.4 SkillRegistry (技能レジストリ)
* **役割**: Capability を実現するために必要な抽象スキル（例: `WebArchitecture`, `BrowserDebug`, `CodeAudit`, `Testing`）の定義および検索。

### 3.5 SkillPipeline (スキルパイプライン)
* **役割**: 開発タスクを完了させるために順次実行すべき Skill の順序関係（シーケンス）を組み立てる。

### 3.6 ExecutionLedger (実行台帳)
* **役割**: 開発時のすべての実行ステップの契約と実行状態（`PLEDGED`, `ACTIVE`, `SUCCESS`, `FAILURE`）を保存する追記型（Append-only）ログ構造。単調増加する `ledgerId` により識別。

### 3.7 QualityGate (品質ゲートメタデータ)
* **役割**: テスト実行および監査後に得られた品質状態（Critical / Major / Minor の指摘件数、Passed ステータス）を保持する。
