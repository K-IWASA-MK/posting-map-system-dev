# 活動推移グラフカード仕様書 (Activity Trend Card Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard 上で活動推移を描画する折れ線 SVG グラフ（`ActivityTrendCard.js`）の構造定義および表示仕様を規定する。

---

## グラフ構造と SVG 定義 (SVG & Structure Details)
グラフは、外部の描画ライブラリ（Chart.js や D3.js）に依存せず、軽量かつ安全なバニラ SVG を生成して出力する。

```html
<section class="card premium-glass grid-col-2" data-motion="fade-up" data-delay="[DELAY]">
  <h2>Activity Trend</h2>
  <div class="chart-container">
    <svg viewBox="0 0 500 200" class="trend-svg">
      <!-- 1. 背景グリッドライン -->
      <line x1="50" y1="50" x2="450" y2="50" class="grid-line" />
      <line x1="50" y1="100" x2="450" y2="100" class="grid-line" />
      <line x1="50" y1="150" x2="450" y2="150" class="grid-line" />
      
      <!-- 2. 折れ線パス (Stroke dash-offset アニメーション対応) -->
      <path d="[SVG_PATH_DATA]" class="trend-line" />
      
      <!-- 3. データポイントおよび発光エフェクト -->
      <circle cx="[X]" cy="[Y]" r="4" class="trend-point" />
      <circle cx="[X]" cy="[Y]" r="8" class="point-glow" />
    </svg>
  </div>
</section>
```

---

## 表示・演出要件 (Visual Requirements)
- **発光点 (Point Glow)**:
  - 主要な活動データポイントの背景に、不透明度を調整した円 (`circle` 枠) を重ねて配置し、CSS の `filter: drop-shadow` や微発光演出を用いて強調可視化する。
- **線描画アニメーション (Drawing Motion)**:
  - 描画時に `trend-line` に対し、CSS `stroke-dasharray` と `stroke-dashoffset` を利用したライン描画アニメーション（ドローイングモーション）を適用する。
