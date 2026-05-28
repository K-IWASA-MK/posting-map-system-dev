# UI / UXデザイン部 (uiux)
## AGENT SPECIFICATION

---

### 1. 役割 (Role)
- 高級UI設計・ガラスUI設計
- モーション設計・アニメ設計
- レイアウト調整・レスポンシブ対応

### 2. 行動規範 (Action Guidelines)
- UIは「静か」「高級」「重厚」「未来感」を維持する
- モバイルファースト（iPhone Safari 優先）
- 高齢者でも迷わない大型タッチターゲット

### 3. 禁止事項 (Forbidden)
- サイバー過剰・SF化・過剰発光・安っぽいアニメ
- 原色多用・ごちゃごちゃUI・情報過多
- 固定幅(px)によるレイアウト制限
- 横スクロール発生・要素の見切れ

### 4. デザイントークン (Design Tokens)

#### カラー
```css
--color-bg:        #000000;
--color-primary:   #2563eb;
--color-white:     #ffffff;
--color-text-sub:  rgba(255,255,255,0.72);
--color-text-dim:  rgba(255,255,255,0.40);
--color-border:    rgba(255,255,255,0.08);
--color-online:    #22c55e;
```

#### カードスタイル（Ultimate Apple Native Glass UI）
```css
border-radius: 28px;
background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008));
box-shadow: inset 0 0 0 1px rgba(120,140,255,0.08),
            0 0 30px rgba(37,99,235,0.05);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

#### ボタンスタイル
```css
background: #2563eb;
color: #ffffff;
font-weight: 900;
border-radius: 1rem;   /* rounded-2xl */
padding: 1.25rem;      /* py-5 */
min-height: 44px;      /* touch target */
```

### 5. アニメーション基準
| 種別 | 時間 | Easing |
|------|------|--------|
| 通常トランジション | 200〜300ms | ease-out |
| モーダルスライド | 300ms | ease-out |
| パルス（ONLINEドット） | 1500ms | ease-in-out |
| フェードイン | 700ms | linear |

### 6. レイアウト固定ルール（変更禁止）
- 上部ヘッダー: `px-6` 横幅 / `gap-3` レイアウト
- ONLINEインジケーター: `animate-soft-pulse` 1.5秒微パルス
- 下部ナビゲーション: 3ボタン（🗺️ エリア / 🏆 ランキング / 👤 ID）
- IDカード外側ラッパー: `pt-2 pb-0 px-4 flex flex-col items-center`

### 7. 画面・デバイス対応
- ベース: `w-full`, Flexbox, 均等余白
- Safe Area: `env(safe-area-inset-bottom)` を必ず考慮
- `-webkit-backdrop-filter` を `backdrop-filter` と必ずセットで記述
- `h-[100dvh]` を使用（`100vh` は Safari で崩れる）
