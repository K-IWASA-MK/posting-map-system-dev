# Development Skill Pipeline Specification

## 1. Overview
Skill Pipeline は、特定の Capability を実現するために必要な複数の Skill（技能）を実行フェーズごとに論理的かつ決定論的な順序で構成するパイプライン定義体です。  
本モジュールはオーケストレーションの構造定義のみを責務とし、実際の実行（Execution）やツールとの接続ロジックは一切含みません。

---

## 2. Core Concepts & Enums

### 2.1 SkillPipelineStatus (Enum)
パイプラインのライフサイクル状態を対称構造として管理します。
* `ACTIVE`: 利用可能。
* `INACTIVE`: 一時無効化。
* `DEPRECATED`: 非推奨。
* `EXPERIMENTAL`: テスト運用中。

---

## 3. Validation & Skill Ordering Rules

### 3.1 Order Rule (順序制約規則)
パイプラインに登録される `skillIds` は、Skill Category に基づいて以下の単調非減少（Non-decreasing）の順序で並んでいなければなりません。

```
Analysis (0)
     ↓
Validation (1)
     ↓
Transformation (2)
     ↓
ExecutionPlanning (3)
     ↓
Audit (4)
     ↓
Reporting (5)
     ↓
Documentation (6)
```

もし、インデックスの高いカテゴリ（例: `Audit: 4`）の Skill の後に、インデックスの低いカテゴリ（例: `Analysis: 0`）の Skill が配置されていた場合、バリデータは `INVALID_PIPELINE_ORDER` としてエラーをスローします。

---

## 4. Data Structure & Metadata

### 4.1 SkillPipeline (不変定義体)
* **`pipelineId`**: `pipeline-1`, `pipeline-2` 等の単調増加ID。
* **`pipelineName`**: パイプラインの一意名称。
* **`description`**: 説明テキスト。
* **`capabilityId`**: 親 Capability の ID。
* **`skillIds`**: パイプラインを構成する Skill ID の配列。
* **`priority`**: 優先レベル（数値）。
* **`status`**: `SkillPipelineStatus` の Enum 値。
* **`version`**: パイプライン仕様のバージョン（セマンティックバージョン形式）。
* **`pipelineVersion`**: 対称メタデータ用のパイプライン内部バージョン。
* **`createdAt`**: パイプライン生成日時。
* **`updatedAt`**: パイプライン最終更新日時。

### 4.2 Registry Metadata (レジストリメタデータ)
Symmetric な構成を維持します。
* **`registryId`**: `reg-pipeline-01`
* **`registryVersion`**: `"1.0.0"`
* **`createdAt`**: レジストリ初期化日時。
* **`updatedAt`**: レジストリ最終更新日時。
