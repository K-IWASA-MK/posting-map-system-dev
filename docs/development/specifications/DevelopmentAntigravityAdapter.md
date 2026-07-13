# Development Antigravity Adapter Specification

## 1. Overview
Antigravity Adapter は、AIOS が開発作業を進行するために最初に使用する具象ツールアダプターのメタデータ定義モデルです。  
本モジュールはメタデータの保持、静的解決、および依存関係の検証のみを責務とし、IDE 制御の実実行処理は一切含みません。

---

## 2. Core Concepts & Enums

### 2.1 AntigravityCommandCategory (Enum)
コマンドの機能カテゴリを分類します。
* `Architecture`: 設計定義、アーキテクチャ監査
* `Frontend`: HTML/CSS, UI表示コンポーネント操作
* `Backend`: API定義、サーバー・データベース制御
* `Debugging`: 障害解析、コンソールトレース
* `Testing`: ユニットテスト、E2Eテスト実行
* `Documentation`: 仕様書、引継ぎ、メモリ更新
* `Release`: リリース、タグ打鍵、ビルド検証
* `Utility`: ヘルパー、プロジェクトユーティリティ

### 2.2 AntigravityCommandStatus (Enum)
コマンドの利用状態を管理します。
* `ACTIVE`: 利用可能
* `INACTIVE`: 一時停止
* `DEPRECATED`: 非推奨
* `EXPERIMENTAL`: 先行開発中

---

## 3. Architecture Boundary (疎結合化設計)

### 3.1 Interface Implementation (インターフェース実装)
`AntigravityAdapter` は抽象クラスや継承ではなく、共通の `ToolAdapter` インターフェースを `implements` するクラスとして実装します。これにより、将来 Claude や Gemini アダプター等を追加する際に対称性を維持できます。

### 3.2 Key-based Decoupling (キーベースの分離)
Antigravity コマンド名そのものは Registry に紐付くキーとはせず、AIOS 内で一意で安定した抽象 ID (`ag-command-001` 等) を主キーとして扱います。実際のコマンド名（`chrome-devtools` 等）は文字列情報（`commandName`）としてのみ定義されます。

### 3.3 Command Registry as Single Source of Truth
`AntigravityAdapter` 自体はコマンドの実態（オブジェクト）を重複して抱え込まず、対応するコマンド ID 配列（`supportedCommandIds`）のみを保持します。バリデータは、それら全ての ID が `AntigravityCommandRegistry` に登録されているかを厳密に検証（SSOT 整合性）します。

```
Development OS
      │
      ▼
ToolAdapter
      │
      ▼
AntigravityAdapter  ➔ supportedCommandIds
                                 │
                                 ▼
                     AntigravityCommandRegistry ➔ AntigravityCommand
```
