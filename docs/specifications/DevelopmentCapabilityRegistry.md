# Development Capability Registry Specification

## 1. Overview
Capability Registry は、Development OS における開発能力（Capability）の定義、整合性検証、およびルックアップを一元的に管理する Single Source of Truth (SSOT) です。  
各開発作業（計画、実装、テストなど）がどの Capability 範囲で行われるかを厳密にマッピングし、不正な操作や権限逸脱を防止するためのセキュリティ基盤の要となります。

---

## 2. Core Concepts & Enums

### 2.1 CapabilityStatus (Enum)
開発能力の利用可否状態を管理します。
* `ACTIVE`: 利用可能。
* `INACTIVE`: 一時停止中。
* `DEPRECATED`: 非推奨。将来削除予定。
* `EXPERIMENTAL`: 試験運用中。

### 2.2 CapabilityCategory (Enum)
目的志向の抽象カテゴリを管理します。
* `Architecture`: システム設計・共通憲章定義
* `Planning`: 実装計画・タスク割当て
* `Implementation`: ソースコードの実装および修正
* `Testing`: テストプログラムの作成と実行
* `Review`: 品質監査およびレビュー検証
* `Debugging`: 不具合の原因特定とデバッグ
* `Documentation`: ドキュメント・仕様書の作成と整備
* `Release`: リリース用タグの付与、リリース処理

---

## 3. Data Structure & Metadata

### 3.1 Capability (不変定義体)
* **`capabilityId`**: `capability-1`, `capability-2` 等の単調増加ID。
* **`capabilityName`**: Capability の一意名称。
* **`category`**: `CapabilityCategory` の Enum 値。
* **`description`**: 説明テキスト。
* **`priority`**: 実行優先レベル（数値）。
* **`status`**: `CapabilityStatus` の Enum 値。
* **`version`**: セマンティックバージョン文字列（例: `"1.0.0"`）。

### 3.2 Registry Metadata (レジストリメタデータ)
Registry は自身を識別および監査するための以下のメタデータを持ち、完全に不変です。
* **`registryId`**: レジストリの一意識別子。
* **`registryVersion`**: レジストリ自体のバージョン（例: `"1.0.0"`）。
* **`createdAt`**: レジストリの初期化日時。
* **`updatedAt`**: レジストリの最終更新日時。

---

## 4. Architecture & Flow
1. **`CapabilityFactory`** は、各プロパティを検証した上で、単調増加IDを付与した `Capability` オブジェクトを生成し、`Object.freeze` をかけて不変化します。
2. 生成されたオブジェクトは **`CapabilityValidator`** を通じて検証（重複ID、必須項目、Enum 値のチェック）され、合格したもののみが **`CapabilityRegistry`** に登録されます。
3. 開発ルール（`DevelopmentRules`）およびリゾルバー（`CapabilityResolver`）は、登録された `CapabilityRegistry` のみを参照して、タスクを解決します。
