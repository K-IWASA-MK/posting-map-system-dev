# ダッシュボードモーション仕様書 (Dashboard Motion Specification)

## モーション理念 (Motion Philosophy)
ダッシュボード上のすべてのアニメーションは、AIOS Kernel の内部状態を人間に分かりやすく伝えるための「Quiet Motion（静かな上質感）」で構成され、派手な Bounce や過剰な回転、ゲーム風の演出は一切排除する。

---

## アニメーションレイヤー設計 (Animation Layer Architecture)
モーションは純粋に表示の演出（Visual Layer）のみを担当し、データを決定・書き換えるロジックや状態の判定ロジックは一切持たない。
- **一方向アニメーション制御**:
  - `Mock Dashboard Data` -> `Dashboard.js (描画完了)` -> `DashboardMotion.js` -> `CSS/JS Animation`
  - アニメーション中に数値が変動しているように見える演出（Rolling Number）を行う場合であっても、実際のデータ値の書き換えは一切行わない。

---

## パフォーマンス・ルール (Performance Rules)
滑らかな 60fps レンダリングを維持し、レイアウトシフトや CPU 負荷を最小限に抑えるため、以下のルールを厳守する。
1. **CSS トランジション優先**:
   - 原則として、アニメーションは `transition`, `transform`, `opacity`, `keyframes` を用いた CSS 定義で実装する。
2. **描画負荷の回避**:
   - `requestAnimationFrame` や JavaScript タイマーの常時監視ループによる過剰な DOM 更新は禁止する。
3. **タイムライン・タイミング**:
   - アニメーションは初期表示ロード時および特定の status 変更検知時のみトリガーされる。
