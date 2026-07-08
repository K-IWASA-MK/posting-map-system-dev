# AIOS Dashboard Layout Engine Specification
# Version: 1.0 (Phase 167)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の構築に向け、ダッシュボード上の各ウィジェットの配置、グリッド割り当て、レスポンシブなブレイクポイント、およびレイアウト情報を決定論的に統合管理する **Dashboard Layout Engine Foundation** を定義する。
本仕様は、将来のワークスペース切り替えやナビゲーションコントロール等に活用可能な、位置情報を持ったレイアウト管理の共通規盤となる。

---

## 2. Layout 定義 (Layout Definition Schema)

各 Layout 仕様は以下のデータ構造を持ち、`Object.freeze()` によって厳格に不変化（Immutable）される。

```typescript
interface WidgetPlacement {
  readonly widgetId: string;        // 配置対象のウィジェットID (Registryに存在すること)
  readonly x: number;               // グリッド開始 X座標
  readonly y: number;               // グリッド開始 Y座標
  readonly w: number;               // カラムスパン（幅）
  readonly h: number;               // ロースパン（高さ）
}

interface LayoutDefinition {
  readonly layoutId: string;        // レイアウト一意ID (例: "lyt-exec-desktop")
  readonly layoutName: string;      // 表示名 (例: "Executive Desktop Grid Layout")
  readonly layoutType: string;      // レイアウト形態 (例: "grid", "flex")
  readonly columns: number;         // グリッドカラム数 (例: 12)
  readonly rows: number;            // グリッド行数 (例: 8)
  readonly widgets: WidgetPlacement[]; // 配置ウィジェット情報の配列
  readonly breakpoint: string;      // 対象画面幅カテゴリ (例: "desktop", "tablet", "mobile")
  readonly priority: number;        // 優先度
}
```

---

## 3. レスポンシブ規則および判定 (Responsive Rule & Placement)

レイアウトエンジンは、クライアントのビューポート幅（Viewport Width）に基づいて、使用するレイアウト仕様を決定論的に選択する。

### 3.1 ブレイクポイント定義
- **desktop**: 画面幅 `>= 1024px`
- **tablet**: 画面幅 `768px` 以上 `1024px` 未満
- **mobile**: 画面幅 `< 768px`

### 3.2 判定ルール
- エンジンは現在の画面幅に最もマッチする `breakpoint` 属性を持つレイアウト定義をレジストリから抽出する。
- 該当するブレイクポイントの定義が存在しない場合は、`priority` に基づきデフォルトのレイアウトを選択する。
- レイアウト上の `widgets` 内の各ウィジェットIDが、`DashboardWidgetRegistry` に正しく登録されているかをバリデーションし、未登録の場合は描画対象から除外する。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Layout 基盤およびテスト表示用レイアウトカードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - ドラッグ＆ドロップによる並び替え操作、サイズ変更操作等のインタラクションUIは本フェーズでは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動配置」「配置提案」等のテキストや、これらを暗示するUI装飾は一切含めない。
