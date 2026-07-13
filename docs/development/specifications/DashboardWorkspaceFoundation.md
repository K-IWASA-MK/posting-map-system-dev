# AIOS Dashboard Workspace Foundation Specification
# Version: 1.0 (Phase 168)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の構築に向け、ダッシュボード上のコンポーネント（Widget）および配置グリッドレイアウト（Layout）を業務ドメインや業務目的に応じてパッケージング・定義する **Dashboard Workspace Foundation** を定義する。
本仕様は、各ワークスペースがどのビューポート表示や表示レイアウト・対象ウィジェットとマッピングされるかを決定論的に構成する Workspace 管理の共通基盤である。

---

## 2. Workspace 定義 (Workspace Definition Schema)

各 Workspace 定義は以下のデータ構造を持ち、`Object.freeze()` によって厳格に不変化（Immutable）される。

```typescript
interface WorkspaceDefinition {
  readonly workspaceId: string;       // ワークスペース一意ID (例: "wsp-executive")
  readonly workspaceName: string;     // 表示名 (例: "Executive Operations Workspace")
  readonly workspaceCategory: string; // カテゴリ (例: "executive", "operational", "trust")
  readonly description: string;       // ワークスペースの説明文
  readonly layoutId: string;          // 紐付くデフォルトのレイアウトID
  readonly widgetIds: string[];       // 紐付く表示対象のウィジェットIDリスト
  readonly priority: number;          // 表示・ソート優先度
  readonly status: string;            // 状態 (例: "active", "deprecated")
  readonly viewMode: string;          // 対応するビューポートクエリ値 (例: "executive", "operations")
}
```

---

## 3. 決定論的マッピングおよびバリデーション (Mapping & Validation Rule)

### 3.1 ビューポートマッピング
- 各 Workspace は、サイドメニューリンクやクエリパラメータ `?view=` に対応する一意の `viewMode` 属性を持つ。
- このフェーズでは `viewMode` は静的な対応メタデータとして保持するのみであり、動的な画面切り替えアクションやナビゲーションハンドリングは行わない。

### 3.2 構成のバリデーション
- Workspace Factory は、定義に含まれる `layoutId` が `DashboardLayoutRegistry` に存在すること、および `widgetIds` リスト内のすべてのIDが `DashboardWidgetRegistry` に存在することを検証する。
- 整合性が欠如している（未登録のレイアウトやウィジェットを参照している）仕様は、インスタンス生成時にバリデーションエラーをスローするか、ビルド警告を出す。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Workspace 基盤およびテスト表示用ワークスペースカードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - ワークスペースの追加、削除、編集、保存等のインタラクションUIは本フェーズでは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動配置」「自動生成」「自動切替」等のテキストや、これらを暗示するUI装飾は一切含めない。
