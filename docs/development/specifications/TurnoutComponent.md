# 投票率コンポーネント仕様書 (Turnout Component Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard における投票率（Turnout）表示コンポーネントの役割、マウント配置、および Props 伝播における単方向論理境界を規定する。

---

## コンポーネント責務とデータフロー (Component Responsibility & Props Flow)
コンポーネントは受信したデータ（Props）を元に HTML マークアップを返すのみの完全な表示専用（Observer View）である。

```
[DashboardDataAdapter.js (データ取得・正規化)]
           │
           ▼
[DashboardRenderer.js (Props のアタッチ)]
           │
           ▼
[TurnoutCard.js (HTML 生成)]
  └── [TurnoutProgressBar.js (メーター描画)]
           │
           ▼
[DOM Mount Point (#dashboard-grid-container)]
```

---

## Observer 境界条件 (Observer Boundary)
- **投票率計算の禁止**:
  - 得票予測、投票者数変動、勝敗判定、当落確率（`winner`, `prediction`, `forecast`）といったロジックをコンポーネント内部で計算してはならない。すべて API からの受信値をそのままマッピングして表示する。
- **操作系UIの排除**:
  - `button`, `form`, `input`, `select` などの手動操作・更新用 UI は一切追加せず、完全な観測専用（Observer）とする。
- **データ不変性**:
  - API からの取得データは Read Only であり、GET 以外のリクエストメソッドは一切使用しない。
