# AIOS Dashboard Navigation Foundation Specification
# Version: 1.0 (Phase 170)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の構築に向け、ダッシュボード全体の画面遷移、サイドバーのアクティブ表示ハイライト、クエリパラメータ `?view=` による URL ルーティングを一元管理する **Dashboard Navigation Foundation** を定義する。
本仕様は、ナビゲーション情報を静的レジストリにて決定論的かつ不変化（Immutable）に定義し、ブレッドクラムや初期ビュー表示、StateManager との連携を容易にする共通基盤である。

---

## 2. Navigation 定義 (Navigation Schema)

各ナビゲーション定義は以下のデータ構造を持ち、`Object.freeze()` によって厳格に不変化される。

```typescript
interface NavigationDefinition {
  readonly navigationId: string;       // ナビゲーション一意ID (例: "nav-executive")
  readonly navigationName: string;     // 表示名 (例: "Executive Summary")
  readonly viewMode: string;           // クエリパラメータ `?view=` の値 (例: "executive")
  readonly workspaceId: string;         // 関連付けられている Workspace ID (例: "wsp-executive")
  readonly category: string;           // カテゴリ名 (例: "core", "governance", "operations")
  readonly route: string;              // パス表現 (例: "/executive")
  readonly icon: string;               // アイコンタグ/クラス名
  readonly priority: number;            // ソート表示優先度
  readonly status: string;              // 状態 ("active", "deprecated")
  readonly breadcrumb: string[];        // パンくずリスト階層名配列 (例: ["Dashboard", "Executive Summary"])
  readonly defaultView: boolean;        // デフォルト初期表示ビューであるかどうか
}
```

---

## 3. ナビゲーション解決および同期 (Navigation Resolving & Sync Rule)

### 3.1 ビューモード ⇔ ルート相互変換
- ナビゲーションマネージャーは、クエリパラメータ `?view=` から適切なナビゲーション定義を決定論的に解決する。
- 該当するビューモードが未登録の場合は、`defaultView: true` に設定されているナビゲーション定義をフォールバック先として解決する。

### 3.2 状態同期
- ナビゲーション解決時は、対応する `workspaceId` および `viewMode` を `DashboardStateManager.updateState` にマージし、状態木を同期する。
- 状態同期時の変更検知により、サイドバーのアクティブ要素スタイル（`.active` 等）が決定論的に再適用される。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Navigation 基盤およびテスト表示用ナビゲーションカードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - サイドバーリンクは既存の `<a>` アンカー構造をそのまま維持し、そこへの新しい動的編集、順序変更、お気に入り等の操作ボタンは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動遷移」「自動判断」等のテキストや、これらを暗示するUI装飾は一切含めない。
