# Dashboard Mobile Executive Visualization Specification (DashboardMobileVisualization.md)

## 1. モバイル・エグゼクティブビュー仕様 (Mobile Executive View)
本仕様は、スマートフォンなどのモバイル端末からの監視・状態確認に特化した「Mobile Executive View」のレイアウト設計、ビュー制御ロジック、およびコンポーネント構成を定義する。

### 表示切り替え優先順位 (View Routing Priority Rules)
操作UI（ボタン等）の設置を伴わずに、閲覧端末や目的の検証モードに適した表示モードを割り当てるため、レンダリング時に以下の優先順位（Priority Rule）を適用して画面を自動マウントする。

1. **URL クエリパラメータ指定（最優先）**:
   - `?view=raw`: 従来の 8レイヤー生カードおよびイベントログ（PC版Rawビュー）を描画。
   - `?view=executive`: PC版のエグゼクティブ・ビューを描画。
   - `?view=mobile`: モバイル・エグゼクティブ・ビューを描画。
2. **画面幅自動検知 (Viewport Auto Detection)**:
   - URLクエリパラメータの指定がない場合のみ、ブラウザ幅（`window.innerWidth`）を評価する。
   - `window.innerWidth < 768px` の場合 ➔ モバイル・エグゼクティブ・ビューを自動マウント。
3. **デフォルト判定 (Fallback Default)**:
   - クエリ指定がなく、画面幅が 768px 以上の場合は、従来の PC版エグゼクティブ・ビュー（`executive`）をデフォルト表示する。

---

## 2. 表示要素とモバイル適合ルール (Mobile Visual Components)

### ① Mobile Header
スマートフォン上の情報表示限界に配慮し、ヘッダーの高さを 50px にスリム化。
- タイトル: `AIOS Mobile Monitor`
- ステータスバッジ: `● ONLINE` または `● OFFLINE` (小発光パルス付き)
- 時刻: `Last Update: HH:MM:SS` (簡素化された現在時刻スタンプ)

---

### ② Mobile KPI Cards (2x2 グリッド)
PC版の Top KPIデータを再利用し、狭い画面に収まるよう `2カラム × 2行` のコンパクトなグリッドで配置する。余計な説明テキスト（サブテキスト）は最小限にトリミングし、タッチ時のはみ出しを防止する。

---

### ③ Mobile Intelligence Flow (縦型 5大ノードフロー)
スクロール量と縦スクロール導線の操作性を考慮し、フローグラフを縦方向（↓）の接続で可視化する。また、表示されるレイヤーを以下の **主要 5大ノードに選別（フィルタリング）** して描画する。
- フロー：`Event` ➔ `Timeline` ➔ `Knowledge` ➔ `Insight` ➔ `Memory`
- 各ノードの右（または背景）に現在処理数（データ数）のバッジを配置し、縦並びの矢印（↓）で繋ぐことで、データが要約・資産化される流れをスッキリと表現する。

---

### ④ Latest Activity Stream
メッセージ文字列は `ExecutiveAdapter` に基づいて静的ルール変換された非技術文言（例: `Runtime: Database link established`）を適用する。
- スマートフォンの幅を考慮し、1行あたりのテキスト量を制限。はみ出した場合は自動的に `...`（ellipsis）で省略する。
- 最新の 5件〜10件のみを表示するコンパクト設計。

---

### ⑤ Evolution Status (構造変化量)
ADD / MODIFY / REMOVE の構造変化カウンターのみを表示。デザインは極限まで無駄を削ぎ落とし、各ステータス値とラベルを 1行の水平バー（またはシンプルなインジケータ）で表現する。

---

### ⑥ Pattern / Memory Summary (蓄積サマリー)
パターンの蓄積数、および長期メモリの保持限界・占有パーセンテージのみをシンプルにテキスト表示。ゲージ表示などは最小サイズで表現する。

---

## 3. レスポンシブ & 操作制限ルール (Observer Mobile Guardrails)
- **タッチターゲット**: 要素の間隔を狭めすぎず、1つずつのカードおよび要素間にタッチ誤作動防止の十分なマージン（8px〜12px）を設ける。
- **Observer Boundaryの絶対順守**: 設定入力項目、フォーム、タップによる実行操作、外部連携ボタン等は一切排除し、完全な Read-Only の状態でプレミアム漆黒 UI の中に美しく描画する。
