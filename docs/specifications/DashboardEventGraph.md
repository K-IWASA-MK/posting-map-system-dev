# Dashboard Event Graph Specification (DashboardEventGraph.md)

## 1. グラフ構造監視アーキテクチャ (Graph Observer Architecture)
イベントグラフ層は、相関チェーン（Correlation Chain）から抽出されたイベントとその接続情報を関係構造（Node & Edge Graph）として保持・描画する Observer レイヤーである。
AI予測、原因特定（RCA）、および自動での意志決定・アクション実行（Decision Engine）は一切行わず、客観的なトポロジー関係の可視化のみを行う。

---

## 2. ノード・エッジのライフサイクル (Node & Edge Lifecycle)
* **生成 (Creation)**:
  リアルタイムイベントの受信 ➔ タイムライン蓄積 ➔ 相関チェーン抽出 ➔ グラフ構築ビルダーの順に非同期連携し、対応するノード（Node）およびエッジ（Edge）が自動生成される。
* **破棄 (Eviction)**:
  ストア（`DashboardEventGraphStore`）の容量上限（最大 100 グラフ、1000 ノード）に達した場合、最も古いグラフおよびそのノード/エッジから順に自動破棄（スライディングウィンドウ）する。

---

## 3. レンダリング・パイプライン
```
[Correlation Update] ➔ [Graph Builder] ➔ [Graph Store] ➔ [Graph Card Render]
```
グラフカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、コマンドの逆方向送信などの操作は一切配置しない。
