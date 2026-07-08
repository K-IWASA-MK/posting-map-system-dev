# Event Evolution Visualization Specification (EventEvolutionVisualization.md)

## 1. ビジュアル表現規則 (Visual Evolution Rules)
エボリューション表示用 UI（`EventEvolutionCard`）は、以下の表示仕様に従って構成される。

* **Evolution Card**: premium-glass スタイルを適用したグリッド幅 2 の全体カード。
* **Change Category Badge**: 変化タイプに基づき配色が切り替わる透過バッジ（例: `ADD` は緑、`MODIFY` は黄色、`REMOVE` は赤）。
* **Before / After Comparison**: 前後の状態差分を並列（Side-by-Side）または前後の記述形式でコンパクトに整列表示。
* **Source Label**: 変化元レイヤー（Timeline, Knowledge等）を表示し、変化がどの領域で生じたかをひと目で確認できるように配置。

---

## 2. 操作排除と表示制限
* コピー操作や表示アンカー以外の、システム操作アクション（元に戻す、再試行などの制御ボタン）は一切配置しない。
* 余白を活かしたノイズレスな漆黒ガラス UI を順守する。
