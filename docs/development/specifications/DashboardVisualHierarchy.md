# Dashboard Visual Hierarchy Specification (DashboardVisualHierarchy.md)

## 1. 概要
本仕様は、AIOS Dashboard における情報の重要度および視認優先度（Visual Hierarchy）を定義する。
ユーザーがダッシュボードを開いた瞬間に、最重要ステータスから詳細ログへと自然に視線が誘導されるように、配色、サイズ、コントラストを統制する。

---

## 2. 視線誘導と情報優先度 (Priority Map)

ダッシュボードにおける情報の重要度順位は以下の通り定義する。

1. **第1優先 (Highest): 環境および生存状態 (Global Status)**
   - 対象: Header Component (Environment バッジ, LIVE/OFFLINE ステータスバッジ)
   - 意図: システムが現在どの環境で動いており、正常に応答しているか（LIVEか）を一目で確認させる。
2. **第2優先 (High): 各カーネルレイヤーの生存状態 (Kernel Run States)**
   - 対象: Kernel Status Card (Execution, Review, Quality などの稼働状況バッジ)
   - 意図: 自律ループが停止していないか、警告が出ていないかを素早く検知させる。
3. **第3優先 (Medium-High): クオリティおよび主要実績指標 (Key Performance Indicators)**
   - 対象: MetricCard, KnowledgeCard, GovernanceCard, TurnoutCard (総合投票率等)
   - 意図: 品質スコアや承認待ち件数、ライセンス期限などの即時実績を読み取らせる。
4. **第4優先 (Medium): 活動推移グラフ (Activity Trend Chart)**
   - 対象: ActivityTrendCard (SVG 折れ線グラフ、発光データポイント)
   - 意図: 活動量の増減傾向を視覚的に直感把握させる。
5. **第5優先 (Low): システム活動履歴ログ (Activity Audit Logs)**
   - 対象: ActivityLogCard (時系列監査ログリスト)
   - 意図: 過去のアクティビティを時間順に遡って追跡可能にする。

---

## 3. 配色とレイヤーの優先順位定義 (Coloring Priority Rules)

ブランド・運用規範書（AGENTS.md）に定義された配色設計を厳格に順守する。

- **Layer 1: Pure Black (#000000)**
   - アプリケーション全体の背景色。いかなる UI 要素もこの Layer 1 を無用に明るい色に上書きしてはならない。
- **Layer 2: Carbon Charcoal (#1C1C1E)**
   - すべてのカード要素およびヘッダー・サイドバーの固定背景色。
- **アクセント青 (#2563eb)**
   - セクションヘッダー枠線、数値、バッジ、アクティブなナビゲーション項目。システムの「主要機能」と「信頼性」を表現する。
- **アクセント緑 (#22c55e)**
   - ONLINE、LIVE、PASS、AUTHORIZED などの「正常動作」を表現するステータスバッジおよび特定のカウンター用。
- **アクセント橙 (#ea580c)**
   - 警告（WARNING）、エラー、新着ログの発光、アクティブデータポイントのグロー光彩用。

---

## 4. タイポグラフィ階層 (Typographical Scale)

テキストの強弱は、フォントサイズ・太さ（Weight）・不透明度（Opacity）の組み合わせによって定義する。

- **見出し (H1/Header Title)**: `1.25rem` / Weight: `700` / Color: `#ffffff`
- **カードタイトル (H2/Card Title)**: `1.1rem` / Weight: `600` / Color: `#ffffff`
- **主要数値 (Value/Large Metric)**: `1.5rem` 〜 `1.8rem` / Weight: `700` / Color: 白またはアクセントカラー
- **通常文字・リスト項目**: `0.9rem` 〜 `0.95rem` / Weight: `500` / Color: `rgba(255,255,255,0.88)`
- **補助テキスト・ラベル (Label/Subtext)**: `0.8rem` 〜 `0.85rem` / Weight: `500` / Color: `rgba(255,255,255,0.6)` 〜 `rgba(255,255,255,0.72)`
- **フッタ・メタデータ (Footer/Meta)**: `0.7rem` / Weight: `700` / Letter-Spacing: `0.15em` / Color: `rgba(255,255,255,0.4)` (大文字表示)
