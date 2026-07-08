# Event Memory Visualization Specification (EventMemoryVisualization.md)

## 1. ビジュアル表現規則 (Visual Memory Rules)
メモリ表示用 UI（`EventMemoryCard`）は、以下の表示仕様に従って構成される。

* **Memory Card**: premium-glass スタイルを適用したグリッド幅 2 の全体カード。
* **Historical Timeline**: 過去のスナップショット発生履歴を縦軸または横軸の静的な接続ラインとドットで整理表示。
* **Snapshot Summary**: 保持されたスナップショットの状態（前回の状態など）をシンプルなコード記述風フォント（monospace）で可視化。
* **Retention Indicator**: ストアの蓄積限界（最大 1000 件）に対する現在の利用状況を表示するインジケータ（静的バー）。

---

## 2. 操作排除と表示制限
* スナップショットの選択・アンカーリンクの追従以外の、履歴の削除・編集・再適用などの制御ボタン（操作 UI）は一切配置しない。
* 余白を活かしたノイズレスな漆黒ガラス UI を順守する。
