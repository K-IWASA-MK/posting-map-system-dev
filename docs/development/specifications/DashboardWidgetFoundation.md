# AIOS Dashboard Widget Foundation Specification
# Version: 1.0 (Phase 166)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 を完成させるための第一段階として、ダッシュボード上のすべての表示要素（Widget）のライフサイクル、メタデータ、および登録・インスタンス化を統一管理する共通基盤 **Dashboard Widget Foundation** を定義する。
本仕様は、以降のレイアウトエンジン（Phase 167）、ワークスペース管理（Phase 168）、および状態管理（Phase 169）の確固たるアーキテクチャ基盤となる。

---

## 2. Widget 定義 (Widget Definition Schema)

各 Widget は以下のメタデータ構造を持ち、`Object.freeze()` によって厳格に不変化（Immutable）される。

```typescript
interface WidgetDefinition {
  readonly widgetId: string;        // 一意のウィジェット識別子 (例: "wdg-timeline")
  readonly widgetType: string;      // 表示タイプ (例: "card", "graph", "metric")
  readonly widgetCategory: string;  // ウィジェットカテゴリ (例: "operational", "trust", "tenant")
  readonly widgetTitle: string;     // 表示タイトル (例: "Event Timeline Card")
  readonly widgetVersion: string;   // バージョン番号 (例: "1.0.0")
  readonly widgetPriority: number;  // 描画・初期化優先度 (値が小さいほど高優先)
  readonly widgetStatus: string;    // ウィジェットの動作状態 (例: "active", "deprecated")
  readonly viewModes: string[];     // 表示対象のビューモードリスト (例: ["executive", "raw"])
  readonly componentName: string;   // UIコンポーネントクラス名 (例: "EventTimelineCard")
}
```

---

## 3. 決定論的ライフサイクル (Widget Lifecycle)

Widget は生成から描画まで、以下の決定論的ライフサイクル状態を辿る。

```
CREATED ➔ REGISTERED ➔ READY ➔ RENDERED
```

1. **CREATED (生成)**:
   - Widget Factory によってインスタンス化され、メタデータが付与された直後の状態。
2. **REGISTERED (登録)**:
   - Widget Registry へ登録完了し、システムによって認識されている状態。
3. **READY (準備完了)**:
   - 描画に必要な依存関係（データソース、コンテキスト等）がすべて解決され、DOM へのマウントが可能になった状態。
4. **RENDERED (描画完了 - 終端状態)**:
   - DOM への配置・初回レンダリングが完了した状態。
   - **ライフサイクル制約**: `RENDERED` が本ライフサイクル管理の終端状態（Terminal State）であり、これ以降の状態定義は本フレームワーク内では行わない。以降の差分データ更新等の状態管理は、将来の State Manager (Phase 169) へ委譲する。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Widget 基盤およびテスト表示用ウィジェットカードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - レイアウトの並び替え、追加、削除などの編集系UIは本フェーズでは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動配置」等のテキストや、これらを暗示するUI装飾は一切含めない。
