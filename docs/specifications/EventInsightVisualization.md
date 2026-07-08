# Event Insight Visualization Specification (EventInsightVisualization.md)

## 1. ビジュアル表現規則 (Visual Insight Rules)
インサイト表示用 UI（`EventInsightCard`）は、以下の表示仕様に従って構成される。

* **Insight Card**: premium-glass スタイルを適用したグリッド幅 2 の全体カード。
* **Category Badge**: 各インサイトの主カテゴリに基づき、アクセントカラーが変化する透過型バッジ（例: `RUNTIME` は青色、`GOVERNANCE` は紫色）。
* **Trend Summary**: 統計データに基づき客観的に生成されたサマリーテキストを中央に明瞭配置。
* **Metrics Wrap**: 件数（Count）、比率（Ratio）、期間（Period）の3つのメタ数値をグリッド構成で美しく整列表示。

---

## 2. 操作排除と表示制限
* ボタンやリンククリックなどの対話型操作要素は一切配置せず、インサイトのビジュアル提示のみに限定する。
* 余白を活かしたノイズレスな漆黒ガラス UI を順守する。
