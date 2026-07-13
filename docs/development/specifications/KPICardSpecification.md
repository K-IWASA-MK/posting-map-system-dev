# KPI カード構造仕様書 (KPI Card Specification)

## 概要 (Overview)
本仕様書は、ダッシュボード上に各種メトリクスを描画する際の基礎部品となる「汎用 KPI カード」の構造、表示要件、および属性指定（Motion 属性等）を規定する。

---

## KPI カード構造定義 (Component Structure)
各 KPI カードは、以下の HTML5 セマンティクスおよび内部構成で描画され、一貫した視覚的階層を維持する。

```html
<section class="card premium-glass" data-motion="fade-up" data-delay="[DELAY]">
  <h2>[LABEL / TITLE]</h2>
  <div class="metrics-list">
    <!-- 主値表示セクション -->
    <div class="metric-item">
      <span class="label">[PRIMARY_METRIC_LABEL]</span>
      <span class="value [COLOR_CLASS]" id="[VALUE_ELEMENT_ID]">[VALUE] [UNIT]</span>
    </div>
    <!-- 補足ステータス表示セクション -->
    <div class="metric-item">
      <span class="label">[SECONDARY_METRIC_LABEL]</span>
      <span class="sub-text" id="[SUBTEXT_ELEMENT_ID]">[SUBTEXT / TREND]</span>
    </div>
  </div>
</section>
```

---

## 属性定義 (Properties)
コンポーネントが受信するPropsおよびマークアップ設計項目。
- **Label**: メトリクスグループの大タイトル（例: `Quality Metrics`）。
- **Value**: 主たる実績の数値または文字列。
- **Unit**: 数値の末尾に付加する単位（例: ` %`, `件`）。
- **Color Class**: 主値に適用するアクセントカラー（アクセント青: `accent-blue`, アクセント緑: `accent-green` 等）。
- **SubText / Trend**: デルタ変動や補助情報（例: `Delta: +4.2`）。
- **Motion Attribute**: フェードイン用の `data-motion="fade-up"` および Staggered 出現用の `data-delay="[ms]"`。
