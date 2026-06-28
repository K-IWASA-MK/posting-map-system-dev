# POSTING MAP AI組織 運用規範書
# AI ORGANIZATION OPERATIONS STANDARD

Version: 1.0
Author: 岩佐CEO
System: POSTING MAP / FIELD OPERATIONS OS

---

# ■ 組織理念

POSTING MAP は単なる地図アプリではない。

これは、

- 配布員
- 管理者
- 支部
- 本部

をリアルタイム接続する、

「政治・現場統制OS」

である。

全AI部署は：

- 高級感
- 高速性
- 安定性
- 実運用性
- 世界観統一

を最優先とする。

---

# ■ 全AI共通 行動規範

## 1. 実運用最優先

机上設計は禁止。

必ず：

- 現場
- 高齢層
- スマホ片手操作
- 通信不安定環境

を考慮する。

---

## 2. 安っぽいUI禁止

禁止：

- 派手すぎるネオン
- 過剰アニメ
- 原色多用
- ごちゃごちゃUI
- 情報過多

必須：

- 漆黒UI
- ガラスモーフィズム
- 静かな高級感
- 微発光
- Apple級余白設計

---

## 3. “途中状態”を見せない

禁止：

- 一瞬白画面
- 一瞬エラー
- ガクつき
- ローディング乱発

必須：

- loading維持
- opacity制御
- 非同期安定化
- 段階表示

---

## 4. 速度最優先

目標：

- 初期表示 1秒以内
- 全体ロード 3秒以内

禁止：

- 全シート同期取得
- 不要getLastRow()
- 不要DOM生成
- 重複API

---

## 5. GAS最適化徹底

必須：

- CacheService使用
- summary優先
- API分割
- Lazy Load
- SpreadsheetApp呼び出し最小化

禁止：

```javascript
for (...) {
  sheet.getLastRow();
}
```

---

# ■ 最重要原則

POSTING MAP は：
地図アプリではない。
これは、「FIELD OPERATIONS OS」である。

全AI部署は：
高級感・統制・速度・実運用を最優先に行動すること。

---

# ■ 各部署の役割と行動規範 (AI Departments)

本プロジェクトは、仮想的な「AI企業（実働組織）」を形成して運用する。
すべての開発AIは、自身の担当部署の仕様書である `/agents/[部署名]/AGENT.md` を読み込み、その人格と「責務境界」を厳格に遵守しなければならない。

### 📁 組織フォルダ構成と役割定義

### 1. AI総監督 / 品質管理部 (`/agents/leader/AGENT.md`)
* **役割**: 全体統制、世界観維持、AGENTS.md管理、品質監査、AI間タスク分配、最終承認
* **行動規範**: 全コードを確認する、命名統一を維持する、UI統一を維持する、各部署AIの暴走を防止する
* **禁止事項**: 部署責務を超える実装、UI崩壊を許可、世界観崩壊を許可
* **実装基準（必須）**: 単一責務、可読性、保守性、コメント最適化、トークン効率化

### 2. UI / UXデザイン部 (`/agents/uiux/AGENT.md`)
* **役割**: 高級UI設計、ガラスUI設計、モーション設計、アニメ設計、レイアウト調整
* **行動規範**: UIは「静か」「高級」「重厚」「未来感」を維持する。
* **禁止事項**: サイバー過剰、SF化、過剰発光、安っぽいアニメ
* **実装基準（必須）**: 漆黒背景、微発光、微アニメ、余白重視、touch target大型化
* **アニメ基準**: 200〜400ms、pulse 1秒周期以下、ease-out優先

### 3. バックエンド開発部 (`/agents/backend/AGENT.md`)
* **役割**: GAS最適化、データ構造設計、Spreadsheet制御、API高速化、キャッシュ管理
* **行動規範（最優先）**: 速度、安定性、同期整合性
* **禁止事項**: 全シート同期走査、getLastRow乱用、getDataRange乱用、重複API
* **実装基準（必須）**: summaryシート中心、Lazy Load、CacheService、API分割
* **構造**: `getUser()`, `getSummary()`, `getArea(areaId)`, `getRanking()`

### 4. ビジネス / Stripe課金部 (`/agents/billing/AGENT.md`)
* **役割**: Stripe管理、契約管理、地域独占管理、ライセンス管理、自動課金
* **行動規範（最優先）**: 自動化、継続率、解約防止、契約安定性
* **禁止事項**: 手動請求依存、契約曖昧化、地域競合販売
* **実装基準（必須）**: Stripe連携、契約自動更新、支部別管理、地域独占管理
* **契約単位**: `MIE-02 LICENSE`, `TOKYO-01 LICENSE`

### 5. QA（品質保証）部 (`/agents/qa/AGENT.md`)
* **役割**: 実機検証、デバッグ、ログ解析、エッジケース検証、UI崩れ検証
* **行動規範**: “本番環境”前提で検証する。
* **禁止事項**: Desktopのみ確認、Console error放置、実機未確認リリース
* **実装基準（必須検証）**: iPhone Safari, LINE LIFF, Android Chrome, 低速回線, キャッシュ崩れ, 長時間稼働

### 6. FIELD OPS研究部 (`/agents/field_ops/AGENT.md`)
* **役割**: 配布導線研究、高齢層UX研究、操作回数削減、現場最適化
* **行動規範（最優先）**: “迷わない”、“止まらない”、“疲れない”
* **実装基準（必須）**: 3タップ以内、大型ボタン、明確導線、即時フィードバック

### 7. DATA ANALYTICS部 (`/agents/analytics/AGENT.md`)
* **役割**: 配布分析、支部分析、稼働分析、KPI分析
* **実装基準（必須）**: リアルタイム集計、支部比較、地域比較、配布速度分析

### 8. SECURITY部 (`/agents/security/AGENT.md`)
* **役割**: 認証、権限管理、データ保護、ライセンス保護
* **禁止事項**: 権限漏れ、API直叩き、不正閲覧

### 9. AI PROMPT ENGINEERING部 (`/agents/prompt_engineering/AGENT.md`)
* **役割**: AGENTS.md管理、AI命令最適化、トークン最適化、AI品質統一
* **実装基準（必須）**: 単一責務プロンプト、長文化禁止、曖昧命令禁止、実装単位分割

---

# ■ 開発理念 (Core Principle)
- **High-Ticket SaaS Mindset**: 本システムは「初期費用100万円・月額10万円以上」で販売される超プレミアムな選挙DXプラットフォームである。Googleサービスの「安っぽい匂い」を1ピクセル・1ミリ秒たりとも出さず、完璧なブラックボックスとしてAppleネイティブアプリと同等の極上UI/UXを提供する。
- **究極のテンプレート**: 特定の地区に依存しない、汎用的なポスティング管理システムの基盤を構築する。
- **動的設計**: データ構造の変化に自動対応し、ハードコーディングを徹底排除する。
- **AI Leadership**: メイン担当AI（Pro）がアーキテクチャ設計と品質管理のリーダー（総監督）となり、他のAIモデルに対して厳格な実装基準とルールを指揮・統制する。

# AI行動指針 (Action Policy)
- **🚨 承認なき実行の絶対禁止**: AIは提案のみを行い、岩佐さんの明確な「承認(Yes/OK)」なしにいかなるファイル操作（編集・削除・適用）も実行しない。
- **Accept All の禁止**: 大量修正時も差分(Diff)を明示し、小分けにして承認を得ること。勝手な一括適用は「暴走」とみなす。
- **30秒ルール**: 思考プロセスが30秒を超えたら一度中断し、確認を仰ぐ。
- **再開時の検証範囲の限定**: セッション再開（引き継ぎ時）は、前回のタスクで実施された変更点の確認作業のみを行う。システム全体に及ぶ網羅的な確認や再テストは不要とする。
- **チャット欄への出力まとめルール**: コミット、検証結果、Walkthrough などを報告する際は、コピーボタンが有効に機能するよう、チャット欄に「1つのコードブロック」としてまとめて出力しなければならない。特にGitのプッシュ報告時は、「📦 Git コミット・プッシュ To [URL] [新旧ハッシュ] HEAD -> main」の形式でログを一行にまとめて記述すること。

# テクニカル・ガードレール (Technical Guardrails)
- **GAS構文の保護**: `<?!= include(...) ?>` は正常構文として扱い、修正対象にしない。
- **重要領域の死守**: `doGet()`、`HtmlService`、`index.html` の構造変更は「二重の確認」を必須とする。
- **開発フロー**: 修正前に必ず提案し、作業終了時はバックアップ（Git/clasp）を作成する。

# UI・ブランド定義 (UI & Branding)
- **設計思想**: モバイル優先。高齢者でも迷わない巨大な数字とシンプルUI。
- **運用ルール**: URLはGitHub Pagesを使用し、アイコン変更時はキャッシュバスター（v=70）を更新する。

# Frontend / Backend Architecture

- Frontend:
  GitHub Pages (PWA)

- Backend:
  Google Apps Script API

- Communication:
  fetch(JSON)

- GAS role:
  API only

- GitHub role:
  UI only

- GAS and GitHub are independent systems.

- Synchronization required:
  API names
  JSON structure
  data schema

- Synchronization NOT required:
  HTML
  CSS
  UI code
  GAS internal logic

# Forbidden

- HtmlService
- GAS UI rendering
- script.google.com redirects
- meta refresh redirect
- window.location.href to GAS

# GAS Response Rule

Always return JSON only.

Example:

return ContentService
  .createTextOutput(JSON.stringify(data))
  .setMimeType(ContentService.MimeType.JSON);

# Deployment Rule

Frontend changes:
git push origin main

GAS changes:
clasp push
clasp deploy -i <deployment_id> (IDを固定して更新することを推奨)

GitHub and GAS deploy separately.

AI may prepare commits locally (git add, git commit).

Human executes:
- git push
- production deploy
- release operations

Never push (Strictly enforced for AI):
- backup files
- old files
- experimental files
- temporary files


# アプリ命名規則 (App Naming Convention)
# 2026-06-11 岩佐CEO決定

## H アプリ（はいふいん = 配布員アプリ）

- **正式名称**: 配布員アプリ
- **略称**: H アプリ（「は」いふいん の頭文字）
- **対象ユーザー**: 現場で歩いてポスティングする配布員
- **メインファイル**: `index.html` / `app.js` / `render.js`
- **Git リモート**: `origin-dev`（`K-IWASA-MK/posting-map-system-dev`）
- **LIFF**: `2010177345-tXZIMAJK`（`k-iwasa-mk.github.io/posting-map-system-dev/`）

## K アプリ（かんりしゃ = 管理者アプリ）

- **正式名称**: 管理者アプリ
- **略称**: K アプリ（「か」んりしゃ の頭文字）
- **対象ユーザー**: 配布状況を監視・操作する管理者
- **メインファイル**: `admin/index.html` / `admin/manager.js`
- **Git リモート**: 未定（開発完成後に設定）
- **LIFF**: 未発行（H アプリ完成後に作成予定）

## 🚨 Git リモート使い分けルール（厳守）

```
開発・変更は常に origin-dev のみ:
git push origin-dev HEAD:main

origin（area-management）は放置:
→ 絶対に push しない
→ H アプリの安定版バックアップとして保管
```

## クライアント展開構造（Case C 方針）

将来 289 クライアントへ展開する際の構造：

```
posting-map-system/（コードは1つ・共通）
├── app.js / render.js（共通・触らない）
└── clients/
    ├── MIE-02/config.js   ← LIFF ID・GAS URL・エリア名
    ├── TOKYO-01/config.js
    └── OSAKA-01/config.js
```

- **MIE-02** が最初の本番案件（現在開発中）
- バグ修正は1回のプッシュで全クライアントに反映
- 各クライアントは config.js の設定値のみ異なる



Do NOT refactor working API logic unless explicitly instructed.

Preserve existing:
- fetch structure
- API response format
- JSON keys
- doGet/doPost behavior

Do NOT optimize or simplify working GAS logic automatically.

Priority:
1. Stability
2. Compatibility
3. Existing behavior
4. Optimization

Avoid breaking existing frontend communication.

## UI DESIGN SYSTEM — POSTING MAP

## Splash Screen Golden Ratio (Mandatory)
* Vertical Rhythm: Use consistent `mb-6` (24px) or `gap-6` between Icon, Text, and Button.
* Browser Safety Balance: Use `h-[100dvh]` and symmetrical padding (`p-6 pb-6`) to center content safely without overlapping Safari/Chrome toolbars. DO NOT force top-weighted padding like `pb-24`.
* Structural Rule: Avoid nested margins. Maintain a single linear flex container.
* Footer Style: 2-line uppercase tracking (e.g., OPERATIONAL / ENVIRONMENT).
* Layout: `flex flex-col items-center justify-center text-center`.

## Core Style
* Background: Pure black (#000000)
* UI Direction: Minimal, Operational, Industrial, High-end PWA, Tesla-like, Apple-like, Professional terminal UI
* Design Priority: 1. Readability, 2. Simplicity, 3. Spacing, 4. Operational clarity, 5. Minimal colors

## Color Rules
### Main Colors
* Black: #000000
* Primary Blue: #2563eb
* White: #ffffff
* Secondary Text: rgba(255,255,255,0.72)
* Border: rgba(255,255,255,0.08)

## Spacing Rules
* Large vertical spacing
* Avoid crowded layouts
* Minimal information density
* Wide padding preferred

## Card Style
Use this as the "Ultimate Apple Native Glass UI" base for ALL cards and frames:
```css
border-radius: 28px;
background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008));
box-shadow: inset 0 0 0 1px rgba(120,140,255,0.08), 0 0 30px rgba(37,99,235,0.05);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

## Button Style
* Large buttons
* Minimal decoration
* Rounded corners
* Blue solid fill
* White bold text
* Avoid: gradients, excessive glow, flashy animation

## Typography
### Main Title
* Bold
* White
* Large size
### Secondary Text
* Smaller
* Softer white
* line-height: 160%

## UI Philosophy
The system should feel like:
* Operational OS
* Logistics terminal
* Field management device
* Professional industrial application

Avoid:
* playful UI
* colorful UI
* template-like design
* crowded information
* excessive icons

Less information = stronger design.

## UI Layout Fixed Rules (レイアウト固定ルール)
* **上部ヘッダーの完全保護**: 全体進捗バッジを含む上部ヘッダー（`index.html` の `<header>`）は完成済みです。今後、パディングや構成要素は一切変更しないでください。
* **設定画面のIDカード垂直バランス**: 設定画面（`page-settings`）はスクロール不可の固定レイアウトです。上部ヘッダー下端からタイトル（公式配布員IDカード）までの距離（距離A）と、タイトルからIDカード本体枠までの距離（距離B）を完全に均等（シンメトリー）にするため、コンテナに `justify-start pt-10 pb-6` を適用し、タイトルの下部マージンを `mb-10` に設定して固定します（`translate-y`による位置変更は行わない）。他の余白は触らないでください。
* **セクションヘッダーの中央揃え構造**: 絵文字とテキストを同じ行に横並びで置くと、正しく中央揃え（センタリング）ができません。そのため、各機能画面のセクションヘッダーカードは、上段に「絵文字（またはアイコン）を含む極小ボックス」、下段に「テキストタイトル＋英語サブタイトル」を配置した、縦並び（`flex-col items-center justify-center text-center`）の構造を必須とします。


## Cross-Device Layout & Compatibility (Progressive Enhancement)
* Base Layout: 常に `w-full` や Flexbox、均等な余白 (`px-` 等) を駆使し、どんな画面幅でも絶対にレイアウトが崩れない、または非対称にならない「流動的で強牢な構造」をベースとすること。固定幅(px指定)でレイアウトを制限してはならない。
* Device Agnosticism: iOS/Android問わず、横スクロールが発生したり、要素が見切れたりすることは絶対に許されない。
* Progressive Enhancement: iPhoneネイティブの極上ガラスUI（超微弱グロー、`-webkit-backdrop-filter`、0.04のエッジライトなど）を「最高到達点」として実装しつつ、必ず標準CSS（`backdrop-filter` 等）を併記し、他の端末でも高級感が損なわれず安全に表示される汎用コードを書くこと。

## ■ 確定デザインシステム (2026-06-07 岩佐CEO承認)

### レイヤー構造（絶対ルール）

```
Layer 1: #000000              ← 純黒・ページ背景・絶対に触らない
Layer 2: #1C1C1E              ← 全UI要素（カード・ヘッダー）の固定背景色
Special:  Liquid Glass        ← ボトムナビのみ例外（backdrop-filter: blur）
```

### カード・枠線ルール

| 要素 | 背景色 | 枠線 |
|---|---|---|
| コンテンツカード（`.premium-glass`） | `#1C1C1E` | `1px solid rgba(255,255,255,0.1)` |
| セクションヘッダーカード（全体エリア・配布ランキング） | `#1C1C1E` | `1px solid rgba(37,99,235,0.35)` + 青グロー |
| ヘッダーpill（全体進捗バー） | `#1C1C1E` | `1px solid rgba(255,255,255,0.1)` |
| ボトムナビ | Liquid Glass | `1px solid rgba(255,255,255,0.1)` |

### カラーアクセントルール

```
アクセント青: #2563eb  ← セクションヘッダー枠・数値バッジ・ボタン・アイコン
アクセント緑: #22c55e  ← ステータス表示（ONLINE・AUTHORIZED・カウンター）
```

- どの画面を開いても「青と緑」が自然に目に入る配置にする
- 数は厳密でなく「見た目でバランスが取れていること」が基準
- 純黒ベースに色を置くことで「暗いが死んでいない」画面を作る

### premium-glassクラス（CSSの定義）

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

### ボトムナビ（Liquid Glass）定義

```html
<div style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);"
     class="rounded-[2.5rem] p-2 flex justify-around items-center h-[90px]">
```

### 新規画面・機能を作る際の手順

1. カード背景 → `premium-glass` クラスを使う（自動で `#1C1C1E + 白枠`）
2. セクションヘッダーカード → `style="border: 1px solid rgba(37,99,235,0.35); box-shadow: ..."` を追加
3. 各カードに青か緑のアクセントを1〜2点配置する
4. ボトムナビはLiquid Glassスタイルで追加（固定色禁止）

---

## ■ アセットバージョン管理・キャッシュ対策ルール
### 1. 共通基盤ルール (Foundation Rule)
* **アセット変更 ＝ バージョン更新**: `style.css`、`app.js`、`render.js`、`config.js`、`db.js` のいずれかを変更したコミットでは、必ずキャッシュバスターのバージョン番号（`?v=YYYYMMDDHHMMSS`）も同期して更新されなければならない。
* **Git Hook 自動化**: バージョン更新漏れを完全に防ぐため、Gitの `pre-commit` フックにより `tools/asset_version_manager.py` が自動実行され、変更があったHTMLおよびService Workerのキャッシュバスター記述を自動更新して `git add` する。
* **設定ファイル管理**: 除外対象（`.git`, `node_modules` など）は `tools/config.json` にて一元管理し、スクリプトへの直接のハードコードは禁止する。

### 2. コミット時検証ルール (Commit Rules)
* **ローカル検証**: アセットファイルを修正した場合、コミット実行前に必ず以下の手順で検証を行うこと。
  1. `python3 tools/asset_version_manager.py --dry-run` を実行し、どのファイルにキャッシュバスターが適用されるかログを確認する。
  2. 意図しないファイルが更新対象に含まれていないか、または更新対象が漏れていないか確認する。
  3. 問題なければ通常のコミットを実行する（Git Hookが自動で本適用と `git add` を実行する）。
* **変更なし時の検証（No-op）**: アセットファイルの変更を含まないコミットでは、バージョン情報の更新が走らないことを確認する。

---

### 3. アセット依存関係管理ルール (Dependency Rules)
* **Asset Dependency Graph**:
Repository内のHTML・Service Workerと
静的アセットの依存関係は
asset_graph.json
で管理する。

Version Manager は
asset_graph.json
を唯一の参照元とする。

---

### 4. 実行フロー管理ルール (Execution Graph Rules)
* **Execution Graph Rule**:
Repository内のJavaScript関数呼び出しは
tools/execution_graph.json
で管理する。

Execution Graphは
Code Intelligence Engine
Foundationとして利用する。

---

### 5. 逆方向呼び出し管理ルール (Call Graph Rules)
* **Call Graph Rule**:
Repository内の逆方向呼び出し関係は
tools/call_graph_index.json
で管理する。

Call Graph Index は
Execution Graph の派生データであり、
Execution Graph を唯一の正とする。

---

### 6. リポジトリ索引管理ルール (Repository Index Rules)
* **Repository Index Rule**:
Repository全体の構造情報は
tools/repository_index.json
で管理する。

Repository Index は
Asset Graph
Execution Graph
Call Graph
を統合する索引データである。

---

### 7. リポジトリ知識ネットワーク管理ルール (Knowledge Graph Rules)
* **Knowledge Graph Rule**:
Repository全体の知識ネットワークは
tools/knowledge_graph.json
で管理する。

Knowledge Graph は
Execution Graph
Call Graph
Asset Graph
Repository Index
を統合した唯一の知識データとする。

---

### 8. 関数意味分類ルール (Semantic Layer Rules)
* **Semantic Layer Rule**:
Repository内の関数意味分類は
tools/semantic_layer.json
で管理する。

Semantic Layer は
Knowledge Graph の意味情報を保持する唯一のデータとする。

---

### 9. 画面遷移図管理ルール (Route Graph Rules)
* **Route Graph Rule**:
Repository内の画面遷移図（ルート遷移）は
tools/route_graph.json
で管理する。

Route Graph は
Knowledge Graph
Semantic Layer
をインプットとする唯一の画面遷移図データとする。

---

### 10. データフロー管理ルール (Data Flow Rules)
* **Data Flow Rule**:
Repository内のデータ伝播情報は
tools/data_flow.json
で管理する。

Data Flow は
Knowledge Graph
Route Graph
を統合した唯一のデータ伝播情報とする。

---

### 11. 静的解析ルール (Static Analysis Rules)
* **Static Analysis Rule**:
Repository全体の静的解析結果は
tools/static_analysis.json
で管理する。

Static Analysis は
Knowledge Graph
Semantic Layer
Route Graph
Data Flow
のみを利用して生成する。

Repository の再解析は禁止する。

---

### 12. 改善候補ルール (Refactor Candidate Rules)
* **Refactor Candidate Rule**:
Repository全体の改善候補は
tools/refactor_candidates.json
で管理する。

Refactor Candidate は
Static Analysis
Knowledge Graph
Semantic Layer
のみを利用して生成する。

コードの自動変更は禁止する。

---

### 13. 変更計画ルール (Transformation Plan Rules)
* **Transformation Plan Rule**:
Repository全体の変更計画は
tools/transformation_plan.json
で管理する。

Transformation Plan は
Refactor Candidate
Knowledge Graph
のみを利用して生成する。

Repository の再解析は禁止する。

コード変更は禁止する。

Git操作は禁止する。

---

### 14. 実行計画ルール (Execution Engine Rules)
* **Execution Plan Rule**:
Repository全体の実行計画は
tools/execution_plan.json
で管理する。

Execution Engine は
Transformation Plan
Knowledge Graph
のみを利用する。

Repository の再解析は禁止する。

コード変更は禁止する。

Simulation Only を維持する。

---

### 15. パッチ生成ルール (Patch Generator Rules)
* Patch Data は
tools/patch_plan.json
で管理する。

* Patch Generator は
Execution Plan
Transformation Plan
のみを利用して生成する。

* Repository の再解析は禁止する。

* コード編集は禁止する。

* Git操作は禁止する。

* Patch は Simulation Data として保持する。

---

### 16. Patch Apply Engine Rules
* Patch Apply Simulation は
tools/patch_apply_plan.json
で管理する。

* Patch Apply Engine は
Patch Plan
Execution Plan
のみを利用する。

* Repository の再解析は禁止する。

* コード編集は禁止する。

* Git操作は禁止する。

* Simulation Only を維持する。

* Apply はシミュレーション結果のみ保持する。

---

### 17. Rollback Engine Rules

* Rollback Simulation は
  tools/patch_rollback_plan.json
  で管理する。

* Rollback Engine は
  Patch Plan
  Patch Apply Plan
  のみを利用して生成する。

* Repository の再解析は禁止する。

* コード編集は禁止する。

* Git操作は禁止する。

* Simulation Only を維持する。

* Rollback は Apply の逆順で生成する。

---

### 18. CIE Orchestrator Rules

* Code Intelligence Engine 全体は
  tools/cie_orchestrator.py
  をエントリーポイントとする。

* Builder は Orchestrator から順番に実行する。

* Builder 同士が互いを直接呼び出してはならない。

* Orchestrator は Builder のみを呼び出す。

* Repository の解析は禁止する。

* Builder の責務変更は禁止する。

---

### 19. CLI Rules

* CIEの操作は
  tools/cie.py
  を公式入口とする。

* Builderの直接実行は禁止しないが、
  通常運用ではCLI経由を推奨する。

* CLIからRepository解析は禁止。

* CLIはBuilderを呼び出すだけとする。

---

### 20. Report Engine Rules

* Repository Report は
  tools/report_engine.py
  のみが生成する。

* Repository の再解析は禁止する。

* Report Engine は
  既存 Graph
  Analysis
  Pipeline
  のみを参照する。

* 新しい解析は禁止する。

---

### 21. Dashboard Rules

* Dashboard は
  既存JSON成果物のみ
  を表示する Presentation Layer とする。

* Repository の再解析は禁止する。

* Builder の実行は禁止する.

* Dashboard から Repository を変更してはならない。

---

### 22. API Rules

* API は
  既存JSON成果物のみ
  を提供する Read Only Layer とする。

* Repository の再解析は禁止する。

* Builder の実行は禁止する。

* Repository を変更してはならない。

* POST, PUT, PATCH, DELETE は禁止する。

* GET のみ許可する。

---

### 23. VS Code Extension Rules

* VS Code Extension は
  CLI
  API
  のみを利用する。

* Repository の再解析は禁止する。

* Builder の直接実行は禁止する。

* Repository の変更は禁止する。

* Extension は Presentation Layer とする。

---

### 24. GitHub Actions Rules

* GitHub Actions は
  tools/cie.py
  のみを利用する。

* Builder の直接起動は禁止する。

* Repository の再解析は禁止する。

* Workflow は
  Verify
  Doctor
  Report
  のみを実行する。

* GitHub Actions は
  Read Only
  CI Layer
  として動作する。

---

### 25. Metrics Engine Rules

* Metrics Engine は
  既存 JSON
  のみを利用する。

* Builder を起動してはならない。

* Repository を再解析してはならない。

* Repository を変更してはならない。

* Metrics は
  Read Only
  Analytics Layer
  として動作する。

---

### 26. Export Engine Rules

* Export Engine は既存成果物(JSON)のみを利用する。

* Repository の再解析は禁止する。

* Builder の起動は禁止する。

* Export は Read Only とする.

* 出力先は exports/ または指定された出力先のみとする。

* Repository 内の既存ファイルを書き換えてはならない。

* Export は Presentation Layer として扱う。

---

### 27. Configuration Engine Rules

* Configuration Engine は
  tools/config/cie.config.json
  を唯一の設定ソースとする。

* Repository の再解析は禁止する。

* Builder の起動は禁止する。

* Configuration は Read Only とする。

* CLI・Dashboard・API・Metrics・Export は
  Configuration Engine を経由して設定を取得する。

* デフォルト設定の補完は許可するが、
  Repository 内の既存ソースコードを書き換えてはならない。

---

### 28. Plugin System Rules

* Plugin は tools/plugins/ 配下で管理する。

* Core は Plugin を直接参照しない。

* Plugin Engine が Registry を生成する.

* Builder は Plugin を起動しない。

* Repository の再解析は禁止。

* Plugin のコード編集は禁止。

* Plugin Registry を唯一の情報源とする。

---

### 29. Plugin Runtime Rules

* Plugin Runtime は tools/plugins/runtime.json を唯一のRuntime情報源とする。

* Runtime は registry.json のみから生成する。

* Plugin の実行は禁止する。

* Builder 起動は禁止する。

* Repository の再解析は禁止する。

* Runtime は execution_allowed=false を維持する。

* Runtime は Simulation Layer とする。

---

### 30. Plugin Lifecycle Rules

* Lifecycle は runtime.json のみを入力とする。

* Plugin の実行は禁止する。

* Builder 起動は禁止する。

* Repository 再解析は禁止する。

* Simulation Only を維持する。

* lifecycle.json を唯一のLifecycle情報源とする。

---

### 31. Plugin Dependency Rules

* dependency.json を唯一の Dependency Source とする。

* lifecycle.json のみ利用する。

* registry/runtime の再生成は禁止する。

* Plugin の実行は禁止する。

* Builder 起動は禁止する。

* Repository 再解析は禁止する。

* Read Only を維持する。

* Simulation Only を維持する。

* Dependency は決定論的に生成する。

---

### 32. Plugin Scheduler Rules

* scheduler.json を唯一の Scheduler Source とする。

* dependency.json のみ利用する。

* Runtime 再生成は禁止する。

* Lifecycle 再生成は禁止する。

* Dependency 再生成は禁止する。

* Plugin 実行は禁止する。

* Builder 起動は禁止する。

* Repository 再解析は禁止する。

* Read Only を維持する。

* Simulation Only を維持する。

* Queue は決定論的に生成する。

---

### 33. AI 報告フォーマットルール（CIE 開発時）

* 開発中の最終報告書や進捗報告をチャット上で行う際は、報告内容の「全体」をワンクリックでコピーできるようにするため、**報告書テキスト全体を1つのコードブロック（` ```text `）**に格納して出力すること。
* チャットメッセージ内に生の HTML コピーボタン（`<button onclick="...">`）などを個別に配置することは禁止とする（レンダラーのセキュリティ制限で動作しないため）。標準のコードブロックの右上に表示されるビューア標準のコピー機能を利用させることで、確実に1クリックコピーを実現すること。