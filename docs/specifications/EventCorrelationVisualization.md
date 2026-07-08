# Event Correlation Visualization Specification (EventCorrelationVisualization.md)

## 1. 接続ラインの配色表示仕様 (Severity Line Visualization)
ノード同士を時系列・関連性で結ぶ接続ライン（Connector Line）は、接続元および接続先イベントの最高重要度レベル（Severity）に基づいて自動で配色変更される。

| 重要度レベル (Max Severity) | 表示ラインカラー | ビジュアルエフェクト |
|---|---|---|
| **CRITICAL** | 赤色線 (`#ef4444`) | 赤い微発光（Red Glow Line）の Pulse アニメーション |
| **WARNING** | オレンジ色線 (`#eab308`) | オレンジ色の固定実線 |
| **INFO** | 灰色線 (`rgba(255,255,255,0.08)`) | 白色の透過実線 |

---

## 2. 配置レイアウト規則と制限 (Layout Restrictions)
相関表示コンポーネントは、ブラウザ負荷やガタつきを排除するため、以下のレイアウト制限を遵守する。

* **自動配置（力学モデル等）の禁止**:
  D3.js 等で使われるドラッグ可能な力学自動レイアウト（Force-directed layout）や、AI が動的判断してノード位置を最適化する配置ロジックは禁止する。
* **固定縦方向（Vertical Linear Layout）の順守**:
  CSS Flex / Grid を用いた、完全に固定された縦方向の直線配置（または固定階層配置）のみを採用する。これによりレスポンシブ崩れや描画遅延を防止する。
* **グラスモーフィズムの整合性**:
  背景は Layer 2（`#1C1C1E`）、エッジラインは `rgba(255,255,255,0.04)` の透過色をベースとする。
