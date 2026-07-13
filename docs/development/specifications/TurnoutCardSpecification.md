# 投票率カード・進捗バー表示仕様書 (Turnout Card & Progress Bar Specification)

## 概要 (Overview)
本仕様書は、投票率概要および市別投票率の進捗バーを描画する `TurnoutCard.js` および `TurnoutProgressBar.js` の視覚レイアウト、CSS アニメーション、および Glass UI 仕様を規定する。

---

## 視覚構造定義 (HTML Structure)
投票率カードは以下のグリッドレイアウト構造を持ち、各市別の進捗バーはサブコンポーネントとして動的挿入される。

```html
<section class="card premium-glass grid-col-2" data-motion="fade-up" data-delay="[DELAY]">
  <h2>Turnout Status</h2>
  
  <div class="turnout-summary">
    <!-- 全体投票率の数値表示 -->
    <div class="turnout-overall">
      <span class="label">Overall Turnout</span>
      <span class="value" id="overall-turnout-val">[VALUE]%</span>
    </div>
  </div>

  <div class="turnout-list">
    <!-- 市別プログレスバー (TurnoutProgressBar.js) -->
    <div class="turnout-item">
      <div class="turnout-info">
        <span class="city-name">[CITY_NAME]</span>
        <span class="turnout-rate">[RATE]%</span>
      </div>
      <div class="turnout-progress">
        <!-- イージング拡張メーター -->
        <div class="turnout-fill" style="width: 0%;" data-target-width="[RATE]%"></div>
      </div>
    </div>
  </div>
</section>
```

---

## 表示および演出仕様 (Visual & Animation Details)
- **Glass UI デザイン**:
  - カード外枠には `#1C1C1E` 背景に薄い透過エッジライト（`1px solid rgba(255, 255, 255, 0.1)`）を施した `premium-glass` スタイルを適用。
- **進捗バーメーターアニメーション**:
  - 画面表示完了後、進捗メーター（`.turnout-fill`）の幅が `0%` から目的の投票率値（例: `54.2%`）まで、CSS トランジション（`transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1)`）を用いて滑らかに右へ伸びる演出（Width Easing）を適用する。
