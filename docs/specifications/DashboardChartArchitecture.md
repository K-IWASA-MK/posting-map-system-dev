# ダッシュボードグラフ・ログ設計仕様書 (Dashboard Chart & Log Architecture Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard における折れ線グラフ（Activity Trend）および時系列ログ（Activity Log）コンポーネントの構造定義、Props 伝播、および描画境界を規定する。

---

## 描画責任と単方向データフロー (Rendering Responsibility & Props Flow)
コンポーネントは状態変更能力を持たない完全な Observer であり、受信したデータ配列をそのまま SVG や HTML へ変換出力する責任のみを持つ。

```
[DashboardDataAdapter.js (JSONデータ受信)]
           │
           ▼
[Dashboard.js (ライフサイクル制御)]
           │
           ▼
[DashboardRenderer.js (仲介配置制御 & Props受渡し)]
     ┌─────┴─────┐
     ▼           ▼
[ActivityTrendCard] [ActivityLogCard]
     └─────┬─────┘
           ▼
     [DOM Mount Point]
```

---

## 隔離要件と境界条件 (Isolation Requirements)
- **統計・予測計算の禁止**:
  - 各グラフコンポーネント内での予測計算、将来予測、変動要因分析（`Trend` / `Prediction` / `Forecast`）処理は一切行わない。
- **データ取得・通信の禁止**:
  - `fetch` / `axios` を用いたサーバーへの通信や、Stripe, SpreadsheetApp への直接アクセスは一切遮断する。
- **操作権限の完全排除**:
  - ログの消去、手動追加ボタン、グラフデータの書き換え入力、および Kernel の実行トリガー（`approve`, `execute`）などは一切露出させない。
