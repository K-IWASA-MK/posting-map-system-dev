# Event Pattern Visualization Specification (EventPatternVisualization.md)

## 1. ビジュアル表現規則 (Visual Pattern Rules)
パターン表示用 UI（`EventPatternCard`）は、以下の表示仕様に従って構成される。

* **Pattern Card**: premium-glass スタイルを適用したグリッド幅 2 の全体カード。
* **Frequency Meter**: 各パターンの発生頻度（Occurrence Count）を視覚的なメーターやパーセンテージで表示。
* **Timeline Distribution**: 過去の発生履歴時間分布をシンプルなマーカー配置で提示。
* **Similar Structure View**: 同一シグネチャを持つ要素群をリストとしてインデント展開表示。

---

## 2. 操作排除と表示制限
* 設定変更、実行、AI分析再開などの操作ボタンは一切配置せず、パターンの客観的統計提示のみに限定する。
* 余白を活かしたノイズレスな漆黒ガラス UI を順守する。
