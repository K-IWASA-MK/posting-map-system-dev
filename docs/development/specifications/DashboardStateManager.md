# AIOS Dashboard State Manager Specification
# Version: 1.0 (Phase 169)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の構築に向け、ダッシュボード全体のランタイム状態（現在アクティブなワークスペース、レイアウト、ビュー、各ウィジェットの状態、初期化フラグ等）を一元的に保持・取得・差分解決する **Dashboard State Manager Foundation** を定義する。
本仕様は、状態更新を完全に決定論的かつ不変化（Immutable）に実行し、状態追跡・バージョン追跡をサポートする状態管理の共通基盤である。

---

## 2. State Tree 定義 (State Tree Schema)

ダッシュボードの状態木（State Tree）は以下のプロパティを持ち、`Object.freeze()` によって厳格に不変化される。

```typescript
interface DashboardState {
  readonly currentWorkspace: string;   // 現在のワークスペースID (例: "wsp-executive")
  readonly currentView: string;        // 現在のビューモード (例: "executive")
  readonly currentLayout: string;      // 現在アクティブなレイアウトID (例: "lyt-exec-desktop")
  readonly widgetStates: {             // 各ウィジェットのライフサイクル状態マップ
    readonly [widgetId: string]: string; 
  };
  readonly layoutState: object;        // レイアウト追加メタデータ
  readonly workspaceState: object;     // ワークスペース追加メタデータ
  readonly initialized: boolean;       // 初期化完了フラグ
  readonly renderStatus: string;       // 描画ステータス (例: "rendered", "idle")
  readonly stateVersion: number;       // 状態木バージョン番号 (更新のたびにインクリメント)
  readonly lastUpdated: string;        // 最終更新時刻のISOタイムスタンプ
}
```

---

## 3. 決定論的更新および不変化 (State Update & Version Tracking)

### 3.1 Immutable 更新ルール
- 状態木（State Tree）は読み取り専用であり、既存プロパティの直接的な再代入や編集は JavaScript レベルで禁止される。
- 状態更新時は、既存の状態木を浅くコピー（Shallow Copy）し、指定した変更をマージした上で、`stateVersion` をインクリメント、`lastUpdated` を現在時刻に更新した上で、新しい状態木全体を `Object.freeze()` して生成・適用する。

### 3.2 状態同期およびイベント通知
- 状態の更新に成功した場合、`DashboardEventBus` を介して `'dashboard-state-update'` イベントをトリガーし、最新のフリーズ状態木をすべてのリスナーに同期する。
- 状態の更新ロジックに AI による推測、最適化、自律変更などは一切含めない。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 State 管理基盤およびテスト表示用状態カードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - 状態の手動リセット、手動ロールバック等の操作用コントロールは本フェーズでは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動更新」「自動判断」等のテキストや、これらを暗示するUI装飾は一切含めない。
