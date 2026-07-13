# モーショントークン仕様書 (Motion Token Specification)

## 概要
AIOS Dashboard 内のアニメーション一貫性を確保し、滑らかで高級感のあるトランジションを保証するための共通イージングパラメータ（トークン）を定義する。

---

## トークン定義 (Motion Tokens)

### 1. 持続時間 (Duration)
- **Fast**: `150ms` (Status Badge の変化や Hover 微発光用)
- **Standard**: `300ms` (Sidebar 項目の選択切り替えや微グローフェード用)
- **Slow**: `500ms` (新規ページ・カードロード時の Fade In 用)

### 2. 遅延時間 (Delay / Stagger)
- **Header Delay**: `0ms` (初期ロード時に即座に表示開始)
- **Sidebar Delay**: `100ms` (ヘッダー出現後にスライドイン開始)
- **Card Stagger**: `50ms` の等差遅延 (グリッドカードが左から順に階段状に表示されるように制御)

### 3. イージング曲線 (Easing)
- **Ease-Out**: `cubic-bezier(0.16, 1, 0.3, 1)` (標準の極上イーズアウト減速。Apple・iOS 標準準拠)

### 4. 不透明度・スケール・ブラー (Visual States)
- **Fade States**: Opacity `0` から `1` へ変化
- **Scale States**: Transform Scale `0.98` (98%) から `1.0` (100%) へイージング拡大
- **Blur States**: Backdrop-filter Blur `0px` から `20px` へ変化
