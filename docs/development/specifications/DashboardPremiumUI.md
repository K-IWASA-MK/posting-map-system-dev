# Dashboard Premium UI Specification (SaaS Product Version 1.0)

## 1. 目的 (Purpose)
POSTING MAP Product Development Rules Version 1.0 に基づき、Webダッシュボード画面に対して「Glass Morphism」「Depth & Transparency」「Click = Animation」「Elderly Friendly UI」を統一的に適用するための高級感ある UI デザインシステム、レイアウト、および UI コンポーネント基盤を定義する。

---

## 2. 統治デザイン・トークン (Dashboard Design Tokens)

プロダクト全体で統一したビジュアルを維持するため、以下のトークン値を厳格に固定する。

### 2.1. Spacing (余白)
- `gap-xs`: `4px`
- `gap-sm`: `8px`
- `gap-md`: `16px`
- `gap-lg`: `24px`
- `gap-xl`: `32px`
- `gap-xxl`: `48px`

### 2.2. Radius (角丸)
- `radius-sm`: `8px`
- `radius-md`: `16px`
- `radius-lg`: `24px`
- `radius-card`: `28px` (極上角丸基準)
- `radius-pill`: `9999px`

### 2.3. Glass Morphism & Blur (透明度とブラー)
- `bg-glass`: `linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.008) 100%)`
- `border-glass`: `1px solid rgba(120, 140, 255, 0.08)` (微発光ブルー境界線)
- `blur-glass`: `blur(20px)` (WebKit 互換 `-webkit-backdrop-filter: blur(20px)`)

### 2.4. Shadow & Depth (影と奥行き)
- `shadow-glass`: `inset 0 0 0 1px rgba(120,140,255,0.08), 0 0 30px rgba(37,99,235,0.05)`
- `shadow-focus`: `0 0 0 3px rgba(37, 99, 235, 0.4)`

### 2.5. Transition & Animation (イージング・アニメーション)
- `duration-fast`: `150ms` (微ホバー)
- `duration-normal`: `300ms` (カード開閉、スライドイン)
- `duration-slow`: `500ms`
- `easing-out`: `cubic-bezier(0.16, 1, 0.3, 1)` (なめらかな減速)

### 2.6. Typography (フォントスケール)
- `font-family`: `Inter, "Outfit", Roboto, sans-serif` (ブラウザデフォルトを排除)
- `font-title`: `font-size: 32px; font-weight: 800; letter-spacing: -0.05em;`
- `font-card-label`: `font-size: 14px; font-weight: 600; text-transform: uppercase; color: rgba(255,255,255,0.4);`
- `font-card-value`: `font-size: 28px; font-weight: 700; color: #ffffff;`

---

## 3. レイアウトおよびコンポーネント構造 (UI Structure)

ダッシュボードはシングルページ・プレミアムレイアウトとし、以下の階層構造で構成される。

```
+-----------------------------------------------------------------------------------+
|                              DashboardHeader                                      |
+-----------------------------------------------------------------------------------+
|  +---------------------------------------------+  +----------------------------+  |
|  |                                             |  |      AreaDetailPanel       |  |
|  |                  MapPanel                   |  | (Slide & Fade Transition)  |  |
|  |                                             |  |                            |  |
|  |                                             |  | +------------------------+ |  |
|  |                                             |  | |   VoteTurnout Card     | |  |
|  |                                             |  | +------------------------+ |  |
|  |                                             |  | |   EventHistory Card    | |  |
|  |                                             |  | +------------------------+ |  |
|  +---------------------------------------------+  +----------------------------+  |
+-----------------------------------------------------------------------------------+
|  +-----------------------------------------------------------------------------+  |
|  |                     Stats & Inventory Layer (DataGlassCard)                 |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 3.1. DashboardHeader (ヘッダー)
- タイトル「POSTING MAP CONTROL STATION」、同期完了ステータス、およびナビゲーションリンクを表示。

### 3.2. MapPanel (地図可視化部)
- マップ表示および選択された地区ピンのハイライト表示。ピンクリック時はイージングを伴って選択通知を行う。

### 3.3. AreaDetailPanel (地区詳細パネル)
- 地区選択時に右サイドからスライドイン（`easing-out`）する半透明ガラスパネル。
- 地区情報に加えて `VoteTurnout` (過去の国政選挙投票率履歴) と実績 `EventLogItem` を整然とカード表示。

### 3.4. DataGlassCard (共通ビジュアルベース)
- ダッシュボードの各モジュールを包む、不変のガラスモーフィズムコンテナ。

---

## 4. アニメーションポリシー (Animation Policy)
- **ホバーフィードバック**:
  - `DataGlassCard` やリストアイテムのホバー時は `scale: 1.02`、影の強調 (`rgba(37,99,235,0.12)`) を `150ms` で優雅に実行。
- **クリックフィードバック (Click = Animation)**:
  - ボタンや地区クリック時は、一瞬 `scale: 0.96` に縮小し、クリックされた感覚を指先と視覚に与える。
- **展開アニメーション (No Static UI)**:
  - `AreaDetailPanel` の開閉は、右サイドからの `300ms` の `slide-in` と `fade-in` を同期させてガクつきを排除する。

---

## 5. 実データバインディング規則 (Data Binding Rules)
- すべての UI 表示は、`DashboardStateModel` から通知（`subscribe`）された実データのみを利用し、ダミーデータは一切含めない。
- ローディング中 (`isLoading === true`) はカードの不透明度 (`opacity`) を `0.6` に下げ、微小なスケルトンローダーを重ねて表示し、白画面や激しいガクつきを抑止する。
- APIエラー発生時は、赤の警告ボーダーライン (`rgba(239, 68, 68, 0.4)`) をあしらったエラーガラスカードをオーバーレイ表示し、分かりやすいメッセージで案内する。
