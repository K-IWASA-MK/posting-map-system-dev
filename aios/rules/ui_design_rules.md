# UI/UX & デザインシステム共通ルール (rules/ui_design_rules.md)

本ドキュメントは、POSTING MAPのブランドイメージ（漆黒・高級感・未来感）を維持し、高齢の配布員でも直感的に操作できるデザインを統一するためのルールです。

---

## 1. デザインシステム (Design Tokens)

### 1.1 レイヤー構造（絶対ルール）
どの画面においても、以下の3層レイヤー構造を厳守してください。

* **Layer 1: 背景色** -> `#000000` (純黒・絶対に他の色に変更しない)
* **Layer 2: UI要素背景色 (カード、ヘッダー等)** -> `#1C1C1E` (固定背景色)
* **Special: ボトムナビゲーション** -> `Liquid Glass` (微弱な半透明ガラス効果)

### 1.2 カラーアクセント
純黒ベースの画面の中に、以下の2色をアクセントとして効果的に配置します。
* **アクセント青 (`#2563eb`)**: セクションヘッダーの枠線、数値バッジ、主要ボタン、アイコン等。
* **アクセント緑 (`#22c55e`)**: ONLINEステータス、許可状態（AUTHORIZED）、カウンターの増加表示等。

### 1.3 ガラスUIスタイル (`.premium-glass`)
すべてのカード型UIおよびフレームは、以下のCSS定義をベースにした「極上ガラスUI」を使用します。
```css
.premium-glass {
  border-radius: 28px;
  background: #1C1C1E;
  box-shadow: 0 0 30px rgba(37, 99, 235, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 2. レイアウト固定ルール (Layout Anchors)

### 2.1 上部ヘッダーの完全保護
* 全体進捗バッジ等を含む上部ヘッダー（`index.html` の `<header>`）は、パディングや構成要素を一切変更しないでください。

### 2.2 設定画面のIDカード垂直バランス
* 設定画面（`page-settings`）はスクロール不可の固定レイアウトです。
* 上部ヘッダー下端からタイトルまでの距離と、タイトルからIDカード本体枠までの距離をシンメトリー（均等）にするため、コンテナに `justify-start pt-10 pb-6` を適用し、タイトルの下部マージンを `mb-10` に設定して固定します。

### 2.3 セクションヘッダーの中央揃え構造
* 絵文字とテキストを同一行に並べると正しく中央揃えができないため、各機能画面のセクションヘッダーカードは以下の**縦並び構造を必須**とします。
  - **上段**: 「絵文字（またはアイコン）を含む極小ボックス」
  - **下段**: 「テキストタイトル ＋ 英語サブタイトル」の `flex-col items-center justify-center text-center` 構造。

---

## 3. モバイル・マルチデバイス対応 (PWA)

* **タッチターゲットの大型化**: 配布員のスマートフォン片手操作を考慮し、ボタンやナビゲーションリンクはすべて十分な大きさ（最小 48px 以上）と余白を確保してください。
* **セーフエリア (SafeArea) の確保**: iOS（Safari）やAndroid（Chrome）のツールバー、および端末上部のノッチ（凹み）部分にコンテンツが重ならないよう、適切なパディングを設定してください。
* **3タップルール**: 配布員が現場で迷わず操作を完了できるよう、最も重要な操作（配布開始、配布報告など）は「3タップ以内」で完了できる導線設計を維持してください。

---

## 4. ダッシュボード共通グラフ・インタラクションルール (Dashboard Hover UX Rules)

### 4.1 グラフのインタラクション基本要件
ダッシュボード内のすべての可視化コンポーネント（折れ線・棒グラフ等）は、情報を詰め込まずにシンプルさを保つため、**Hover時のみ詳細を表示するオンデマンド型設計**とします。

* **Hover Tooltip**: マウス位置の特定データ詳細のみをポップアップ表示。
* **Hover Line**: 折れ線グラフにおける時間軸の位置を示す細い垂直ガイドラインを表示。
* **Active Point Glow**: 選択されたデータポイントは、ブランドカラーである **`#EA5F08`** で発光させ、視覚的フィードバックを最大化します。

### 4.2 ガラスツールチップ (Glass Tooltip) 実装指標
ツールチップは黒背景を禁止し、以下のGlassmorphismスタイルに準拠させます。

```css
.glass-tooltip {
  position: absolute;
  z-index: 100;
  padding: 12px 16px;
  background: rgba(28, 28, 30, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
  color: #ffffff;
  pointer-events: none;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-tooltip.visible {
  opacity: 1;
  transform: translateY(0);
}
```
