# Event Knowledge Visualization Specification (EventKnowledgeVisualization.md)

## 1. ビジュアル表現規則 (Visual Knowledge Rules)
ナレッジ表示用 UI（`EventKnowledgeCard`）は、以下の表示仕様に従って構成される。

* **Knowledge Card**: premium-glass スタイルを適用したグリッド幅 2 の全体カード。
* **Category Badge**: 各ナレッジの主カテゴリに基づき、アクセントカラーが変化する透過型バッジ（例: `RUNTIME` は青色、`GOVERNANCE` は紫色）。
* **Event Reference List**: 関連イベント ID の参照リストをコンパクトに展開表示。
* **Timeline Link / Graph Link**: 各ナレッジに対応するタイムラインおよびグラフコンポーネントの位置を示すビジュアルインジケータ（表示用アンカー）。

---

## 2. 操作排除と表示制限
* コピー操作やアンカー位置移動以外の、システム操作アクション（承認・実行・再試行ボタン等）は一切配置しない。
* レスポンシブで余白の大きい漆黒ガラス UI を順守する。
