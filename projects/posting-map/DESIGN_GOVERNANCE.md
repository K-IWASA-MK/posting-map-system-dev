# POSTING MAP Design Governance

本リポジトリでフロントエンド開発（H-App、Dashboard (Mobile)、モバイル等）を行うすべての開発者、AIエージェント、およびシステムは、以下の統治規則（Governance Rules）を例外なく厳守しなければならない。

---

## 🛑 Core Rules (最優先原則)

### Rule 1: Do not create custom buttons/badges
- アプリケーション内に独自のスタイルを持つボタン、インプット、ステータスバッジを新設・ベタ書きしてはならない。
- 必ず共通のコンポーネントライブラリ（`/components/`）からインポートまたは呼び出して使用すること。

### Rule 2: Do not hardcode colors
- HTML / JavaScript / CSS 内に生のカラーコード（例：`#00B7FF`、`rgba(0,0,0,0.5)`）を直接記述してはならない。
- 必ず `design-tokens.json` で定義され、`style.css` 内にマッピングされた CSS 変数（例：`var(--color-primary)`）を参照すること。

### Rule 3: Do not duplicate cards or lists
- 情報コンテナ（カード、リストアイテム等）の HTML 文字列や Tailwind クラスを個別に複製・記述してはならない。
- 必ず `/components/card.js` などの共通のコンポーネント描画関数へデータを流し込んで再利用すること。

### Rule 4: Do not access API inside components
- コンポーネント内部で外部の API（GAS API コールやネットワーク接続など）を直接実行・呼び出してはならない。
- コンポーネントは純粋に `JSON ➔ HTML String / HTMLElement` の変換のみを担当する。

### Rule 5: Components must be stateless
- コンポーネントは内部状態（State）を保持してはならない。
- 冪等性を満たし、**「同じデータ入力に対して常に全く同じ HTML 出力」** を返すように設計する。

### Rule 6: Pages own state, Components own rendering
- 画面の状態管理やインタラクションのハンドリング（APIコールや `localStorage` の読み書き等）は、ページ層（`render.js`）が完全に所有する。
- コンポーネントはレンダリング（表示文字列の生成）のみに専念する。

---

## 🛡️ Architecture & Boundaries (責務の境界線)

1. **Tokens (`design-tokens.json` / `style.css`)**: 
   - 見た目の設計変数（色、サイズ、フォント）の Single Source of Truth (SSOT) とする。
2. **Components (`/components/`)**:
   - すべての再利用可能な UI レンダリングの Single Source of Truth (SSOT) とする。渡されたデータ（JSON）に基づいて自律的に HTML 文字列を組み立てて出力する責務を持つ。
3. **Pages (`render.js`)**:
   - 部品の「組み立て（Composition）」の責務のみを持つ。ページ全体のレイアウトやタブ切り替え、各コンポーネントへのデータ配分を行い、自ら部品の HTML を直接生成してはならない。

#### 伝播フロー（Propagation Flow）
```
Design Tokens (JSON / CSS) ➔ Components (JS Functions) ➔ Pages (Composition / render.js)
```
