# リアルタイム更新データフロー仕様書 (Dashboard Realtime Flow Specification)

## 概要 (Overview)
本仕様書は、API から取得された最新の活動ログデータが、ポーリングコントローラーおよびイベントバスを経由して描画コンポーネントへ到達するまでの、疎結合で安全な一方向データフローを規定する。

---

## 疎結合イベント駆動構造 (Event-Driven Data Flow)
ポーリング制御層と UI 描画層が互いに直接依存するのを防ぐため、`DashboardEventBus` を介した Publish/Subscribe 形式を採用する。

```
[GAS KPI Provider (データソース)]
           │ (GET 通信リクエスト)
           ▼
[DashboardAPIClient.js (通信実行)]
           │ (JSON 受信)
           ▼
[DashboardDataAdapter.js (検証・正規化・新着ログ抽出)]
           │ (新着ログ検出時にデータ返却)
           ▼
[DashboardPollingController.js (更新検知)]
           │
           ▼ (Publish: 'new-activity-log' イベント発火)
[DashboardEventBus.js (イベント仲介)]
           │
           ▼ (Subscribe: 更新検知イベントの購読)
[DashboardRenderer.js (仲介配置制御)]
           │ (新着ログ要素データ Prop 伝播)
           ▼
[ActivityLogCard.js (新着ログ差分 prepend 描画)]
           │
           ▼ (DOM Mount 後にイベント発火)
[DashboardMotion.js (Glow 開始 & Smooth Scroll 実行)]
```

---

## 境界と制約 (Logical Boundaries)
- **更新判断の分離**:
  - `DashboardPollingController` は「API 取得トリガーと更新検知」のみを行い、受け取った中身の解析やビジネス判定は行わない。
- **一方向伝播**:
  - UI 描画層（`ActivityLogCard` 等）から `PollingController` に対するリクエスト呼び出しや、API 呼び出し方向への逆流は行わない。
- **データ不変性**:
  - 伝播されるデータはすべて Read Only の正規化済みオブジェクト（不変値）であり、レンダラーやコンポーネント側で直接オブジェクトメンバーを書き換えることはない。
