# ダッシュボードコンポーネント仕様書 (Dashboard Component Specification)

## 目的
Observer Dashboard 内を構成する各 UI エレメント（コンポーネント）の構造、レイアウト要件、および表示内容の責務境界を規定する。

---

## 各コンポーネントの責務定義 (Component Responsibilities)

### 1. ヘッダーコンポーネント (Header Component)
- **表示内容**:
  - `AIOS Kernel Dashboard` (大見出し)
  - Environment: `LOCAL SIMULATION`
  - System Status: `HEALTHY` (緑色表示)
  - Last Update: データロード完了時のタイムスタンプ
- **レイアウト**: 上部固定。高さ 70px。下部境界線（rgba(255,255,255,0.1)）あり。

### 2. サイドバーコンポーネント (Sidebar Component)
- **表示内容**: Navigation メニューの表示のみ。
  - `Dashboard`, `Kernel Status`, `Quality`, `Knowledge`, `Governance`, `Billing`, `Simulation`, `Audit`
- **制約**:
  - 各メニューは静的なナビゲーション表示のみを担当し、Kernelを実行させたり意思決定を変更させるような操作ボタン（Action Trigger）は一切持たない。
- **レイアウト**: 左側固定。幅 240px。右部境界線あり。

### 3. ステータスカードコンポーネント (Status Card Component)
- **表示内容**: 各カーネルのライフサイクル稼働状況の可視化。
  - 対象: Execution, Review, Quality, Learning, Governance, Billing, Simulation 等。
  - ステータスバッジ: `Active` (緑パルス), `Idle` (青), `Warning` (黄), `Error` (赤), `Disabled` (灰)。

### 4. メトリクスカードコンポーネント (Metrics Card Component)
- **表示内容**: 各レイヤーのモック結果値の表示。
  - **Quality Panel**: Quality Score, Review Result, Improvement Delta。
  - **Knowledge Panel**: Total Knowledge, Health Score, Merge Candidate。
  - **Governance Panel**: Pending, Approved, Rejected 件数。
  - **Billing Panel**: License, Subscription, Payment Event 状態。
- **制約**:
  - 表示データはダッシュボード側で計算・改変せず、取得したモック JSON レコードをそのまま描画する。

---

## 各コンポーネントのモーション責任 (Component Motion Responsibility)
各 UI コンポーネントが担当するモーションの動作・演出要件。
- **Header component**:
  - `Slide Down & Fade`: 初期ロード時に上部から下方向へ 500ms かけてスライドフェードインする。
- **Sidebar component**:
  - `Slide In Left & Hover`: 初期ロード時に左端から 500ms かけてスライドイン。メニュー項目へのマウスホバー時に左境界線のインジケーター（アクセント青）をハイライト表示する。
- **Cards component**:
  - `Fade Up & Staggered scale`: 各情報カードは、下部から上方向へ階段状の遅延（Staggered Delay: 50ms差）をもってフェードインし、同時にスケールを 98% から 100% へイージング拡大する。
- **KPI component**:
  - `Rolling Number`: 画面描画開始から 600ms の時間で、数値メトリクス（スコアや件数）を現在の最終目標値までドラムロールカウントアップする。
- **Status component**:
  - `Pulse Badge`: `Active` (緑) または `Idle` (青) のステータスバッジの周囲に、柔らかい波紋状 of 光彩アニメーション（Gentle/Slow Pulse）を無限ループ再生する。

---

## コンポーネント構造の独立分離 (Visual Component Architecture)
ダッシュボードプロトタイプの発展に伴い、各カードおよび表示要素は `src/dashboard/components/` 配下の再利用可能な表示専用クラス群へリファクタリングされる。
- **Props 受信と View 責務の分離**:
  - `KPICard.js`, `StatusCard.js`, `MetricCard.js`, `KnowledgeCard.js`, `GovernanceCard.js`, `BillingCard.js`, `SimulationCard.js` は、一切の通信・計算ロジックを排除し、静的な Props 情報から HTML を返すのみとする。
- **DashboardRenderer の仲介**:
  - 各カードの DOM への配置および Props データのバインド・インサート処理は、`DashboardRenderer.js` が一括して制御し、チラつきのない段階的マウントを実現する。
- **グラフおよびログコンポーネント責任 (Chart & Log Visual Components)**:
  - `ActivityTrendCard.js` (活動推移折れ線 SVG グラフ) および `ActivityLogCard.js` (システム活動ログ) は、時系列データやメッセージ配列を Props 受信し、静的に HTML/SVG を出力する責任のみを持つ。トレンドの予測計算や分析、およびログの動的追加・削除処理は行わない。
- **投票率コンポーネント責任 (Voter Turnout Visual Components)**:
  - `TurnoutCard.js` (投票率カード) および `TurnoutProgressBar.js` (進捗バー) は、投票率・稼働状態・市区町村名を Props 受信し、メーター比率と数値を静的に HTML 描画する。勝敗表現や変動の予測・AI分析などは一切行わない。

---

## コンポーネント視覚的一貫性ルール (Component Visual Consistency Rules)
すべてのダッシュボードコンポーネント（カード型 UI 要素）は、統一された視覚基準を満たすために以下の実装ルールを遵守しなければならない。
1. **カード基調（カードラッパー）**: 常に `.card.premium-glass` をルートタグ（通常は `section` または `div`）に使用し、独自背景色のインラインスタイルは指定しない。
2. **タイトル構成（Card Titles）**: 各カードのタイトルには `h2` タグを使用し、下部に境界線を引いて内容と区切る。
3. **余白適用（Margin/Padding）**: 要素間マージン、リストアイテムギャップはインラインでの指定を禁止し、すべて `Dashboard.css` の Spacing Tokens (`--space-sm`, `--space-md` 等) に基づいてレンダリング時の階層で担保する。
4. **バッジ仕様（Badges）**: ステータス等のバッジは `.badge` に加えて `.badge-active` または `.badge-idle` の共通クラスのみを使用し、角丸は `--radius-md` (12px) とすること。
5. **フォント・配色制御（Typography & Colors）**: テキスト色は CSS カスタムプロパティ（`--text-primary`, `--text-secondary`, `--text-muted`, `--text-dim`）を使用し、アクセントカラーも原則として青（`accent-blue`）、緑（`accent-green`）、橙（`accent-orange`）、赤（`accent-red`）の定義クラスのみを適用する。

---

## レスポンシブ・コンポーネント規則 (Responsive Component Rules)
各コンポーネントは、画面幅の急激な変化やモバイルへの再配置に対して、単独で情報の折り返し・はみ出しを防ぐ以下の措置を遵守する。
1. **テキスト見切れ防止 (Text Overflow Prevent)**:
   市区町村名やログメッセージなど、可変幅のコンテキストを持つインラインテキスト要素には、適宜 `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` を適用するか、折り返し属性を明記する。
2. **アイテムの回り込み (Flex Wrap)**:
   見出し・ステータス等と数値が横並びフレックス配置される場合、極小ビューポートでテキストが重なり合わないよう、`flex-wrap: wrap` を付与しつつ隙間の Gap を確保する。
3. **グラフの伸縮性**:
   `ActivityTrendCard` などの SVG 描画要素は、固定の `width` / `height` 属性によるレンダリングを禁止し、`viewBox` を用いたアスペクト比固定の `w-full` 流動サイジングを採用する。

---

## コンポーネント描画効率化ルール (Component Render Efficiency Rules)
各コンポーネントは、パフォーマンス最適化層の差分更新を支援するため、以下の描画効率化設計を厳守する。
1. **マウント位置（グリッドインデックス）の不変性**:
   ダッシュボード全体のマウント順（配列インデックス）は原則固定とし、動的な追加・並び替え（Logカードの新着追加を除く）によるコンテナ内インデックスの破壊を回避する。
2. **コンポーネント内 API/状態ロジックの排除**:
   コンポーネント関数は純粋関数（Pure Function）として振る舞い、引数の Props のみが描画結果を決定する設計とする。自身の内部で状態（State）を生成したり、更新トリガーを自動発火させてはならない。
3. **Props 構造のフラット化（シリアライズ性確保）**:
   Props は可能な限りフラットなオブジェクトまたはシンプルな配列として受け取り、`JSON.stringify` によるハッシュ比較が正確に機能するデータ型のみで構成すること。

---

## イベント駆動レンダリング規則 (Event Driven Rendering Rules)
各コンポーネントは、非同期で受信されるリアルタイムイベント（ランタイム初期化、警告、品質検証結果）の描画において、以下の規則を遵守する。
1. **即時微発光（Glow）の演出**:
   イベントによって部分的な DOM 更新がトリガーされた要素（Statusバッジや新着ログアイテム、変化したメトリック値など）には、`DashboardMotion.glowCard` などの専用メソッドを介して一定時間（1.5秒）の Glow クラス（`.new-card-glow` 等）を付与し、変化が視覚的に認識できるようにする。
2. **対象外カードの描画ブロック**:
   特定のリアルタイムイベント（例: ランタイム初期化）の影響を受けないコンポーネント（例: 投票率カード等）は、部分置換の差分更新ロジックにより、再レンダリング処理が完全にバイパスされることを保証する。

---

## アテンションルーティング規則 (Attention Routing Rules)
各コンポーネントは、重要度マッピングされたリアルタイムイベントの表示において、以下のルーティング規則を遵守する。
1. **重要度別 CSS クラスのバインド**:
   ログコンポーネント（`ActivityLogCard`）は、描画時に各アイテムの重要度（`severity`）をチェックし、`log-critical` / `log-warning` クラスを安全に付与すること。これにより、警告色の視覚表示を保証する。
2. **キュー順序の強制描画**:
   新着イベントの受信時は、時系列の単純追加ではなくアテンションキュー（`DashboardAttentionQueue`）から取得したソート済み配列に基づき、リスト要素全体の順序を同期再描画すること。

---

## タイムラインコンポーネント規則 (Timeline Component Rules)
タイムラインコンポーネント（`EventTimelineCard`、`EventTimelineMarker`）は以下の規則に従う。
1. **完全な View-Only**:
   承認や実行などのアクショントリガーを配置することは禁止し、純粋な可視化のみを行うこと。
2. **Props 不変性の厳守**:
   コンポーネント内部で渡されたイベント配列のソートや加工は行わず、ストア側で整列済みの配列を読み込み専用（Immutable Props）でそのまま受け取ること。
3. **描画以外の計算の排除**:
   テキストのフィルタリングや推論、AI判定ロジックなどの表示ロジック以外の計算（No Calculation）は一切含まない純粋表示モジュールとすること。

---

## 相関グラフコンポーネント規則 (Correlation Graph Component Rules)
相関グラフコンポーネント（`EventCorrelationCard`、`EventCorrelationNode`、`EventCorrelationLine`）は以下の規則に従う。
1. **因果推論（Inference / Prediction）の厳格排除**:
   コンポーネント内部、および関連ビルダーにおいて、イベントの原因特定、異常発生の予測、成功失敗の論理判断は一切行わないこと。
2. **完全表示専用 (View Only)**:
   ユーザーがクリックできるボタン（button）や入力項目（input, select）、およびフォーム（form）は一切配置しないこと.
3. **不変属性 (Immutable Props) のバインド**:
   ストアから供給される相関配列を不変データとして扱い、コンポーネント内での並び替え・絞り込みなどの書き換え処理は一切行わないこと。

---

## 関係トポロジーグラフコンポーネント規則 (Topology Graph Component Rules)
トポロジーグラフコンポーネント（`EventGraphCard`、`EventGraphNode`、`EventGraphEdge`）は以下の規則に従う。
1. **完全表示専用 (View Only)**:
   承認ボタンや実行入力、送信フォームなどのインタラクティブ要素は一切配置せず、関係トポロジーの描画のみに限定すること。
2. **不変属性 (Immutable Props) のバインド**:
   グラフストアから供給されるグラフデータを不変データとして扱い、コンポーネント内でのデータ加工・追加等の計算処理は一切行わないこと。
3. **因果推論（No inference）の排除**:
   コンポーネント内およびビルダーにおける、AI予測・因果判定ロジック・根本原因決定処理の実装は完全に禁止とする。








