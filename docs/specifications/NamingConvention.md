# 命名規則とドメイン隔離仕様 (Naming Convention & Domain Isolation)

## 概要
本仕様書は、AIOS プラットフォームにおけるコード、ファイル、ディレクトリの命名規則を定義するとともに、プラットフォームの独立性を維持するための「ドメイン隔離ルール（Domain Isolation）」について規定します。

## コード・ファイル命名規則

### 1. 基本規則
- **ファイル名**: アプリケーション層およびSDK/Core層のすべての TypeScript/JavaScript ファイル名は、アッパーキャメルケース（PascalCase）を使用します。（例: `ProjectLifecycle.ts`, `RegistryReader.ts`）
- **クラス名**: ファイル名と完全に一致するアッパーキャメルケースを使用します。
- **関数・メソッド名**: キャメルケース（camelCase）を使用します。（例: `getUser()`, `getArea(areaId)`）
- **定数名**: すべて大文字のスネークケース（UPPER_SNAKE_CASE）を使用します。

### 2. 役割を表すサフィックス
クラスの責務を明確にするため、以下の標準的なサフィックスを付与します。
- `Runtime`: 実行状態やライフサイクルプロセスを管理するクラス（例: `TestRuntime`）
- `Service`: ビジネスロジックや操作を実行するステートレスなクラス（例: `ProjectServices`）
- `Repository`: データアクセスをカプセル化するクラス
- `Controller`: APIや外部からのリクエストハンドリングを担当するクラス
- `Registry`: プラグインやサービス、プロジェクトの登録情報を管理するクラス（例: `ProjectRegistry`）

## ドメイン隔離ルール (Domain Isolation)
AIOS Core（`core/`, `runtime/`, `kernel/`, `sdk/` などのプラットフォーム層）には、特定の業務領域、顧客、または特定のアプリケーション固有の概念や用語を含めてはなりません。これらの概念は「アプリケーション層（`apps/` または `projects/`）」のみに閉じ込めます。

### ❌ AIOS Core での使用禁止キーワード
以下のキーワードは、AIOS Core のコード、ファイル名、ディレクトリ名、コメント、ドキュメントにおいて使用を完全に禁止します。

1. **Election** (選挙)
2. **Posting** (ポスティング・配布)
3. **Flyer** (チラシ)
4. **District** (地区・選挙区)
5. **Dashboard** (管理画面・ダッシュボード)
6. **Spreadsheet** (スプレッドシート - アプリケーションデータとしての操作名)
7. **顧客固有の名称**

### 代替推奨ワード (汎用表現)
ドメイン固有の概念をプラットフォーム側で表現する必要がある場合は、以下のようなドメイン非依存の抽象的表現に置き換えて設計します。
- `Election` / `Posting` -> `Task`, `Job`, `Operation`, `Execution`
- `District` -> `Area`, `Scope`, `Boundary`, `Workspace`
- `Flyer` -> `Asset`, `Payload`, `Content`
- `Spreadsheet` -> `DataStore`, `Storage`, `Ledger`, `Repository`
- `Dashboard` -> `Console`, `Portal`, `Monitor`
