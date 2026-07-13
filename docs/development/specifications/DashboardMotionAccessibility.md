# Dashboard Motion Accessibility Specification (DashboardMotionAccessibility.md)

## 1. 目的とReduced Motion方針
本仕様は、AIOS Dashboard におけるアニメーションやトランジションが誘発する視覚的疲労やめまい（前庭器官への刺激など）を防止・軽減するためのモーションアクセシビリティ対応を定義する。
OS またはブラウザ側で「視覚効果を減らす（Reduced Motion）」が設定されているユーザーを検知し、安全で静的な画面遷移へと自動フォールバックさせる。

---

## 2. prefers-reduced-motion への適合 (CSS & JS)

### CSS レベルでのアニメーション無効化・最小化
- **Transition / Animation の一括停止・軽減**:
  `prefers-reduced-motion: reduce` メディアクエリを定義し、カードのホバー時のスライドアップ、ローディングインジケーターの回転、フェードイン演出等のトランジション時間を `0s` または極小（`0.05s` などの超高速フェード）に切り替える。
  - バッジの脈動（gentle-pulse / slow-pulse）アニメーションは即時停止し、静的なバッジ表示とする。

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    scroll-behavior: auto !important;
  }
}
```

### JS（DashboardMotion）レベルでの即時描写へのフォールバック
- **ドラムロール数値演出（Rolling Number）のスキップ**:
  `prefers-reduced-motion: reduce` が検知された場合、数値を 0 からカウントアップするドラムロール（ドラムロールエフェクト）処理をバイパスし、Props で受け取った最終目標値を即座にテキストとして反映（マウント）させる。
- **SVG および進捗メーター遷移の同期**:
  SVG グラフの折れ線（Stroke Dash Drawing）や、投票率進捗バー（Turnout fill）の幅の拡張トランジションも瞬時に実行させ、途中過程の伸縮を見せない。

---

## 3. 視覚負荷軽減ルール

- **脈動（Pulse）インジケーター**:
  ステータスバッジのゆっくりとした Pulse（呼吸）アニメーションであっても、Reduced Motion 時は一切の脈動を停止する。
- **点滅・明滅の排除**:
  新着ログが追加された際の Glow 演出（明滅）についても、明滅時間を排除するか、背景色の静的な塗りつぶし（アニメーションなしでの強調表示）のみで表現する。
- **stagger（時間差）フェードインのカット**:
  カードの階段状のスタッガー遅延をすべて `0ms` に設定し、画面の初期ロード時に一斉に静的配置されるように制御する。

---

## 4. 動的アクセシビリティの責務境界 (Strict Separation)

- **アニメーション制御限定の原則**:
  Reduced Motion の検知・分岐処理は、純粋に「アニメーションの速度、トランジション時間、演出の有無」を制御するためだけに使用し、**表示するデータそのものの絞り込みや、Kernel データの取得ロジックを変更するために使用してはならない。**
- データ整合性は Reduced Motion の有無に関わらず常に 100% 同一であることを保障する。
