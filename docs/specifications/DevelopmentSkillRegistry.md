# Development Skill Registry Specification

## 1. Overview
Skill Registry は、Development OS 内で実行される各開発技能（Skill）の定義、整合性検証、およびルックアップを一元的に管理する Single Source of Truth (SSOT) です。  
Skill は Capability（開発能力）の下位に位置する具象的かつ抽象化された機能実行の構成単位であり、具体的なツール名や環境（IDE, LLM, Git, Shell）には直接依存しません。

---

## 2. Core Concepts & Enums

### 2.1 SkillStatus (Enum)
開発スキルの利用可否状態を管理します。
* `ACTIVE`: 利用可能。
* `INACTIVE`: 一時停止中。
* `DEPRECATED`: 非推奨。将来削除予定。
* `EXPERIMENTAL`: 試験運用中。

### 2.2 SkillCategory (Enum)
開発スキルの実行特性に応じた抽象カテゴリを管理します。
* `Analysis`: 静的解析、コード調査、メトリクス収集
* `Validation`: テスト実行、整合性確認、コンパイル検証
* `Transformation`: コードのリファクタリング、自動編集
* `ExecutionPlanning`: 実行計画・ADRの作成
* `Audit`: セキュリティ監査、ライセンス監査
* `Reporting`: 変更要約レポートの作成、Walkthrough生成
* `Documentation`: ドキュメント更新、解説書作成

---

## 3. Layer Abstraction Rules & Cardinality

### 3.1 1:N Cardinality (一対多のマッピング規則)
* **Capability → Skill (1:N)**:  
  1つの Capability（例: `Review`）は、複数の Skill（例: `CodeAudit`, `Validation` 等）と静的に関連付けることができます。  
  `Capability` オブジェクト側は、自身がサポートする Skill ID の配列 `supportedSkillIds` を保持します。
* **Skill → Capability (1:1)**:  
  各 Skill は、必ず唯一の Capability ID（`capabilityId`）に静的に固定され、所属先を曖昧にしません。

---

## 4. Data Structure & Metadata

### 4.1 Skill (不変定義体)
* **`skillId`**: `skill-1`, `skill-2` 等の単調増加ID。
* **`skillName`**: Skill の一意名称。
* **`category`**: `SkillCategory` の Enum 値。
* **`description`**: 説明テキスト。
* **`capabilityId`**: 関連付けられた親 Capability の ID。
* **`priority`**: 実行優先レベル（数値）。
* **`status`**: `SkillStatus` の Enum 値。
* **`version`**: セマンティックバージョン文字列（例: `"1.0.0"`）。

### 4.2 Registry Metadata (レジストリメタデータ)
Symmetric に Capability Registry と同じメタデータ構成を持ち、完全に不変です。
* **`registryId`**: レジストリの一意識別子（`reg-skill-01`）。
* **`registryVersion`**: レジストリ自体のバージョン（例: `"1.0.0"`）。
* **`createdAt`**: レジストリの初期化日時。
* **`updatedAt`**: レジストリの最終更新日時。
