# Dashboard Event Evolution Layer Specification (DashboardEventEvolution.md)

## 1. エボリューション層アーキテクチャ定義 (Event Evolution Layer Architecture)
イベントエボリューション層は、時系列・相関・グラフ・ナレッジ・インサイトの時間経過に伴う「構造変化と差分（Before / After）」を構造化・保持する Observer レイヤーである。
AI による原因分析、自動的な異常・改善判断、およびアクションは一切排除し、完全に表示専用の差分整理のみに制限する。

---

## 2. エボリューション・ライフサイクル (Evolution Lifecycle)
* **生成 (Creation)**:
  各インサイト等のデータ更新が完了した段階で、エボリューションビルダー（`DashboardEvolutionBuilder`）が前回状態と最新状態のスナップショット差分（Snapshot Difference）を検出し、新規エボリューションオブジェクト（`Evolution Object`）を生成する。
* **破棄 (Eviction)**:
  ストア（`DashboardEventEvolutionStore`）の容量上限（最大 500 件）に達した場合、最も古いエボリューションから順に自動破棄（スライディングウィンドウ）し、メモリリークを防止する。

---

## 3. レンダリング・パイプライン
```
[Event Insight Update] ➔ [Evolution Builder] ➔ [Evolution Store] ➔ [Evolution Adapter] ➔ [EventEvolutionCard Render]
```
エボリューションカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、コマンドの逆方向送信などの操作は一切配置しない。
