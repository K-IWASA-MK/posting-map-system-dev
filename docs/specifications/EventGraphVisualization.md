# Event Graph Visualization Specification (EventGraphVisualization.md)

## 1. ビジュアル表現規則 (Visual Graph Rules)
グラフ内の各要素は、その重要度（Severity）および相関タイプに連動して以下の表示規則に従う。

### ノード表示 (Node Style)
* **CRITICAL ノード**: 赤い発光（Red Glow Node）をともなう赤枠で強調表示。
* **WARNING ノード**: オレンジ枠で表示。
* **INFO ノード**: 通常の灰色枠（Gray Node）で表示。

### エッジ表示 (Edge Style)
* **CRITICAL エッジ**: 赤い微発光付きの接続線（Glow Line）。
* **WARNING エッジ**: オレンジ色の接続線（Orange Edge）。
* **INFO エッジ**: 白透過の通常接続線（Gray/White Edge）。

---

## 2. レイアウトの固定制約
* ブラウザ崩れと描画オーバーヘッドを避けるため、動的配置シミュレーションは禁止とし、CSS Flex / Grid を用いた階層型固定トポロジー配置のみを採用する。
* すべての要素にプレミアムグラスモーフィズムデザインを適用する。
