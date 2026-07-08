# Dashboard Spacing System Specification (DashboardSpacingSystem.md)

## 1. 概要
本仕様は、AIOS Dashboard で使用されるすべてのレイアウト要素（コンテナ、カード、グリッド、インライン項目）の間隔（Spacing）を一元管理するための Spacing Token システムを定義する。
値はすべて CSS カスタムプロパティ（CSS 変数）として定義され、アドホックなインラインスタイルや不揃いなピクセル指定を排除する。

---

## 2. Spacing Tokens

共通の Spacing Token は 4px のグリッドシステムをベースに策定する。

| Token 名 | CSS 変数値 | 用途 |
|---|---|---|
| `--space-xs` | `4px` | 極小の余白。バッジ内の余白、数値と単位の間隔など。 |
| `--space-sm` | `8px` | 小さめの余白。ラベルと数値の間隔、項目リスト間の行間など。 |
| `--space-md` | `16px` | 中程度の余白。カード内の要素グループ間の縦間隔など。 |
| `--space-lg` | `24px` | 大きめの余白。カード内包の Padding、グリッドギャップの初期値。 |
| `--space-xl` | `32px` | 最大の余白。メインコンテンツコンテナの Padding、セクション間の境界など。 |

---

## 3. Radius Tokens (角丸ルール)

コンポーネントごとの角丸も一貫性を保つためトークン化する。

| Token 名 | CSS 変数値 | 適用対象 |
|---|---|---|
| `--radius-sm` | `4px` | プログレスバーの端、極小バッジ。 |
| `--radius-md` | `12px` | ステータスバッジ、ログリストのアイテム枠など。 |
| `--radius-lg` | `28px` | 各情報カード（`.card`）、ボトムナビゲーション、サイドバーなど。 |

---

## 4. Spacing の適用規約 (Application Rules)

### カード空間設計 (Card Spacing)
- **カードの Padding**: 常に `--space-lg` (24px) を四方に適用する。
- **カードのタイトル下マージン**: タイトル（`h2`）の下部は `--space-md` (16px) の余白を設ける。
- **カード内のリスト項目ギャップ**: リスト（`metrics-list`, `status-list`, `log-list`等）内の各項目間の Gap または下部 Margin は、原則 `--space-md` (16px) または `--space-sm` (8px) とする。

### セクション空間設計 (Section Spacing)
- **メイングリッドの Gap**: 常に `--space-lg` (24px) とする。画面縮小時は `--space-md` (16px) に切り替える。
- **ヘッダーとコンテンツの間隔**: ヘッダーの下端からメイングリッドの上端までは、統一した距離を維持する。
