# Dashboard Event Knowledge Layer Specification (DashboardEventKnowledge.md)

## 1. ナレッジ層アーキテクチャ定義 (Event Knowledge Layer Architecture)
イベントナレッジ層は、時系列・相関・グラフ情報を統合し、「観測された客観的事象の要約（Knowledge Object）」として構造化・保持する Observer レイヤーである。
AI によるトラブル判定、異常検知、および自動アクションは一切排除し、完全に表示専用の要約整理のみに制限する。

---

## 2. ナレッジ・ライフサイクル (Knowledge Lifecycle)
* **生成 (Creation)**:
  イベント関係グラフ（Event Graph）が構築または更新された段階で、ナレッジビルダー（`DashboardKnowledgeBuilder`）が静的抽出・合成処理を実行し、新規ナレッジオブジェクト（`Knowledge Object`）を生成する。
* **破棄 (Eviction)**:
  ストア（`DashboardEventKnowledgeStore`）の容量上限（最大 500 件）に達した場合、最も古いナレッジから順に自動破棄（スライディングウィンドウ）し、メモリリークを防止する。

---

## 3. レンダリング・パイプライン
```
[Event Graph Update] ➔ [Knowledge Builder] ➔ [Knowledge Store] ➔ [Knowledge Adapter] ➔ [EventKnowledgeCard Render]
```
ナレッジカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、コマンドの逆方向送信などの操作は一切配置しない。
