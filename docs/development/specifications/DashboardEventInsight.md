# Dashboard Event Insight Layer Specification (DashboardEventInsight.md)

## 1. インサイト層アーキテクチャ定義 (Event Insight Layer Architecture)
イベントインサイト層は、イベントナレッジ層（Event Knowledge Layer）の要約データを基盤とし、事象のトレンド、発生頻度の統計、および客観的状態変化履歴を表示専用ビュー（Event Insight View）として集約する Observer レイヤーである。
AI によるトラブルの原因分析、障害診断、および自動アクションは一切排除し、完全に表示専用の集約・可視化のみに制限する。

---

## 2. インサイト・ライフサイクル (Insight Lifecycle)
* **生成 (Creation)**:
  ナレッジ更新イベント（`event-knowledge-update`）を受信した段階で、インサイトビルダー（`DashboardInsightBuilder`）が静的集計・トレンド合成処理を実行し、新規インサイトオブジェクト（`Insight Object`）を生成する。
* **破棄 (Eviction)**:
  ストア（`DashboardEventInsightStore`）の容量上限（最大 100 件）に達した場合、最も古いインサイトから順に自動破棄（スライディングウィンドウ）し、メモリリークを防止する。

---

## 3. レンダリング・パイプライン
```
[Event Knowledge Update] ➔ [Insight Builder] ➔ [Insight Store] ➔ [Insight Adapter] ➔ [EventInsightCard Render]
```
インサイトカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、コマンドの逆方向送信などの操作は一切配置しない。
