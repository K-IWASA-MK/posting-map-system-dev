# 動作検証・在庫登録画面UIパーツ修正レポート

ポスティング配布員アプリ（`index.html`、`field/index.html`）の「簡易チラシ保管庫（在庫登録）」画面における各UI要素の表示位置とスタイルについて、ご指示に基づき最終調整を行いました。

---

## 🛠️ 実施した変更点

### 1. デザインガイドライン（.md）へのルール追加
* **[AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md)** および **[agents/uiux/AGENT.md](file:///Volumes/SSD_DATA/posting-map-system/agents/uiux/AGENT.md)** の「レイアウト固定ルール」セクションに以下を追記しました。
  > **セクションヘッダーの中央揃え構造**
  > 絵文字とテキストを同じ行に横並びで置くと、正しく中央揃え（センタリング）ができません。そのため、各機能画面のセクションヘッダーカードは、上段に「絵文字（またはアイコン）を含む極小ボックス」、下段に「テキストタイトル＋英語サブタイトル」を配置した、縦並び（`flex-col items-center justify-center text-center`）の構造を必須とします。

### 2. HTMLファイルのヘッダー構造の修正
* **[index.html](file:///Volumes/SSD_DATA/posting-map-system/index.html)**、**[field/index.html](file:///Volumes/SSD_DATA/posting-map-system/field/index.html)**、および **[manager.html](file:///Volumes/SSD_DATA/posting-map-system/manager.html)**
  * 「簡易チラシ保管庫」（STOCK REGISTRATION）および「保管状況一覧」（FLYER STOCK INVENTORY）の横並び（`flex items-center gap-3`）を廃止。
  * 縦並び（`flex flex-col items-center justify-center text-center gap-2`）に変更し、絵文字 `📦` / `📊` を専用の `w-8 h-8 rounded-xl bg-[#2563eb]/10` ボックスに格納して中央上に配置。

### 3. サブラベルの文字色グリーン化および中央揃え
* 「公式配布員情報」カード、および「保管情報の登録」カードのヘッダーラベルについて：
  * 文字色をデフォルトのホワイト透過から、アクセントグリーン（**`#22c55e`**）に変更。
  * `block text-center` を追加し、カードの幅の中で美しく**中央揃え**に整列。

### 4. プレースホルダーの削除と初期化時の自動クリア（誤認防止）
* 保管枚数の入力欄にうっすら表示されていた `4000` というプレースホルダー（`placeholder="4000"`）が、最初から「4000枚が入力されている」と誤認されるのを防ぐため、プレースホルダーを完全に削除して最初から**完全な空白状態**で表示されるように修正しました。
* また、登録画面に再び戻ってきた際に、前回の入力値や登録完了メッセージ（`✓ 在庫を登録しました`）が残って誤認を招かないよう、画面を開いた瞬間に**入力値を自動的に空にし、完了メッセージも非表示に初期化**する処理を `app.js` に追加しました。

### 5. iOSにおけるインプット・セレクトボックスの表示リセット（文字が消えるバグ修正）
* iOS Safariの標準動作によってインプット（保管枚数）とセレクトボックス（保管場所）が「白背景」で描画されてしまい、文字色（白）と同化して文字が見えなくなっていた問題を解決するため、`style.css` に以下の修正を行いました。
  * `input` および `select` に `-webkit-appearance: none;` / `appearance: none;` を指定し、iOSの強制白スタイルを完全に無効化。
  * 背景色を常にダークグレー（**`#1C1C1E`**）、文字色を **`#ffffff`** に強制適用。
  * iOSのデフォルト矢印が消えた `select` 要素に対して、プレミアム感のある白いカスタム下向き矢印（SVG背景）を適用.
  * iOSブラウザによる自動入力（Autofill）が発生した際に、背景が黄色や白に反転して文字が見えなくなるのを防ぐために `-webkit-autofill` 疑似クラスへのハックを追加。

### 6. スクロール余白の完全解決
* ボトムナビゲーションにボタンや入力フィールドが被るのを防ぐため、静的ビルドで定義されていないTailwindクラスの代わりに、インラインスタイルで **`style="padding-bottom: 160px;"`** を適用しました。
* これにより、スクロールした際に「在庫を登録する」ボタンがボトムナビの完全に上に露出するよう調整されました。

### 7. キャッシュバスターのインクリメント (v427)
* 最新の変更が実機で即座に反映されるよう、`service-worker.js` および各HTMLファイルのキャッシュバスターを `v=427` に更新しました。

---

## 🔍 検証結果まとめ

| 検証項目 | 評価 | 状態 | 備考 |
|---|---|---|---|
| **ヘッダー中央揃え** | ✅ 合格 | 正常 | 在庫登録・在庫一覧の両画面で、ヘッダー要素が中央縦軸で綺麗に整列されていることを確認。 |
| **ラベルのグリーン＆中央化** | ✅ 合格 | 正常 | 「公式配布員情報」と「保管情報の登録」のラベルがアクセントグリーンで中央表示されていることを確認。 |
| **枚数入力（初期空白＆バグ修正）** | ✅ 合格 | 正常 | 初期表示でプレースホルダーがなく完全な「空白」になり、画面を入り直した際にもクリアされることを確認。 |
| **スクロールボタン露出** | ✅ 合格 | 正常 | 在庫登録の決定ボタンがボトムナビの上に完璧に露出することを確認。 |
| **キャッシュ更新検証** | ✅ 合格 | 正常 | キャッシュバスター `v427` を適用し、既存のキャッシュが破棄されて新しいHTML/CSS/JSがロードされることを確認。 |

これにて、すべての画面で [AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md) の高級感と中央対称レイアウトが保たれました。

---

## 💬 LINE設定の調査およびリッチメニュー・トークン設定（2026-06-13）

LINEお友だち追加画面が表示されない問題およびリッチメニューが表示されない問題について、セキュアな解決策を構築して反映しました。

### 1. ⚙️ 設定ねじれの特定
* **現象**: LIFFアプリ（ログイン画面）がリンクしている公式アカウントが `MIE-2/H` (`@196vjbpq`) であるのに対し、GAS側のアクセストークンが `MIE-2/K` (`@278kxomk`) に接続されていました。
* **Bot prompt**: LINE DevelopersのLIFF設定は `On (aggressive)` で正常ですが、岩佐さんのLINEアカウントがすでにリンク先アカウント（`MIE-2/H`）と友だちになっていたため、友だち追加プロンプトがスキップされていました。

### 2. 🔐 セキュアなトークン設定UIの実装
トークンをチャットに貼らずにスプレッドシート上で安全に入力できるよう、 `scripts/v2_ui.gs` に以下を追加しました。
* `setLineTokenHFromUI`: スプレッドシートメニューから `MIE-2/H`（配布員用）トークンを安全に登録。
* `setLineTokenKFromUI`: スプレッドシートメニューから `MIE-2/K`（管理者用）トークンを安全に登録。
* `createRichMenuForHApp`: 登録したトークンを使用して、LINE APIへリッチメニューを自動登録・一発適用。

### 🎨 3. 公式アプリアイコンを使用したリッチメニュー画像アセット
既存のアセットアイコン（`POSTINGMAP` および `ADMINPANEL`）を `2500x1686` の黒背景の中央に配置したプレミアム画像を自動作成し、以下にコミットしました。
* 配布員用 (H): [assets/richmenu_default.png](file:///Volumes/SSD_DATA/posting-map-system/assets/richmenu_default.png)
* 管理者用 (K): [assets/richmenu_admin.png](file:///Volumes/SSD_DATA/posting-map-system/assets/richmenu_admin.png)

これらは `git push` を通してGithub Pagesに公開され、GASから自動参照されて適用されるようになりました。

---

## 🛠️ コードレビュー＆バグ修正（2026-06-15）

### 背景
セッション開始時に `app.js`・`field/index.html`・`scripts/v2_config.gs` を包括レビューし、バグ・設計上の問題点を5件特定。全件修正・デプロイまで完了しました。

---

### 修正1：`field/index.html` — アイコン404バグ（🔴 重大）

**原因**: `field/` サブフォルダ内のHTMLがルートの `assets/` を `./assets/` で参照しており、パスが存在しないため404が発生していた。

```diff
- <img src="./assets/icon180-v2.png?v=257" ...>
+ <img src="../assets/icon180-v2.png?v=257" ...>
```

対象箇所：ゲートウェイ画面（58行）・ローディング画面（85行）の2箇所。

---

### 修正2：`field/index.html` — ヘッダースタイル不一致（🟡 中）

**原因**: `field/` のヘッダー背景が旧スタイル（`bg-white/5 backdrop-blur-xl`）のままで、2026-06-07に確定したデザインシステム（`#1C1C1E` 固定背景）と乖離していた。

```diff
- <div class="bg-white/5 backdrop-blur-xl ...">
+ <div style="background: #1C1C1E; border: 1px solid rgba(255,255,255,0.1);" class="...">
```

---

### 修正3：`index.html` / `field/index.html` — CSSキャッシュバスター不一致（🟢 低）

共通CSS（`tailwind-utils.css` / `style.css`）のバージョン番号が両ファイルで異なっており、キャッシュ不整合のリスクがあった。両ファイルを **v=460** に統一。

| ファイル | 変更前 | 変更後 |
|---|---|---|
| `index.html` | `v=434` / `v=443` | `v=460` |
| `field/index.html` | `v=440` | `v=460` |

---

### 修正4：`scripts/v2_config.gs` — `STORAGE_PARENT_ID` のハードコード除去（🟡 中・セキュリティ）

GoogleドライブフォルダIDがソースコードに直書きされていた。環境依存の機密値は `PropertiesService` で管理するよう変更。

```diff
- STORAGE_PARENT_ID: "17DqCq4hIquqvK96ig8-n6fwb5pTgRE_-"
+ get STORAGE_PARENT_ID() {
+   return PropertiesService.getScriptProperties().getProperty('STORAGE_PARENT_ID') || '';
+ }
```

> 「📁 ドライブフォルダを自動セットアップ」メニューを実行すれば、IDはスクリプトプロパティに自動保存されます。

---

### 修正5：`scripts/v2_config.gs` — クライアント固有値への警告コメント追加（🟢 低・保守性）

将来の289クライアント展開に備え、地域固有のハードコード値（`DISTRICT_CSV`・`DEFAULT_DISTRICT`・`DEFAULT_PREFECTURE` 等）に `⚠️ クライアント固有値` のコメントを追記。

---

### デプロイ完了

| 対象 | コマンド | 結果 |
|---|---|---|
| GAS (`v2_config.gs`) | `clasp push` | ✅ 18ファイル反映 |
| GitHub Pages (`index.html`, `field/index.html`) | `git push origin-dev HEAD:main` | ✅ `e769c65..6230af1` |

---

## 🛠️ 自動キャッシュバスター自動化 (2026-06-26)

アセットファイル（`style.css`、`app.js`、`render.js`、`config.js`、`db.js`）の変更時にキャッシュバスター（`?v=...`）の更新漏れを防ぐため、完全自動化されたバージョン管理システムを導入しました。

### 1. 導入した構成・ツール
* **[tools/asset_version_manager.py](file:///Volumes/SSD_DATA/posting-map-system/tools/asset_version_manager.py)**
  * **自動アセット検知**: `git diff` および `git diff --cached` から変更があったアセットを動的に抽出。
  * **ダイナミックHTMLスキャン**: プロジェクト内の全 `*.html` ファイルおよび `service-worker.js` を再帰スキャンし、対象アセットのバージョン（`?v=...`）とキャッシュ名（`CACHE_NAME`）を現在の日付時間スタンプ（`YYYYMMDDHHMMSS`）へ自動書き換え。
  * **設定ファイル管理**: 除外対象（`.git`、`node_modules` など）は `tools/config.json` にて一元管理（`legacy` 配下のHTMLも将来の保守のためデフォルトでスキャン対象に含む）。
  * **ドライランモード**: `--dry-run` オプションで、ディスク変更を発生させずに更新候補と差分を検証。
* **[tools/config.json](file:///Volumes/SSD_DATA/posting-map-system/tools/config.json)**
  * 除外ディレクトリ設定（デフォルト: `[".git", ".github", "node_modules", "__pycache__"]`）。
* **[.git/hooks/pre-commit](file:///Volumes/SSD_DATA/posting-map-system/.git/hooks/pre-commit)**
  * Git Hookとして登録され、コミット時に自動でアセット変更を検知してHTML/JSのキャッシュバスターを更新し、ステージング（`git add`）まで自動化。
* **[AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md)**
  * キャッシュバスターに関する「共通基盤ルール」および「コミット時検証ルール」を追記。

### 2. 実施した検証テスト（すべて合格）
1. **Basic Update Test (合格)**: `active/mobile/style.css` に変更を加え、スクリプトを実行。HTMLのバージョン番号が `v=20260626190759` へ自動更新され、自動でステージングされたことを確認。
2. **Dry Run Test (合格)**: `--dry-run` 引数を渡して実行した際、変更を行わずに `Detected:` と `Would update:` の候補が綺麗に出力されることを確認。また、`tools/config.json` にて除外を適用したフォルダ（例: `legacy`）が正しくスキップされることを確認。
3. **No-op Test (合格)**: アセット以外の変更（例: `README.md`）のコミット時、キャッシュバスター更新処理はスキップされ、通常のコミットが正常に進行することを確認。
4. **Git Hook 結合テスト (合格)**: `git commit` コマンド実行時に pre-commit フックが自動起動し、最新の秒単位タイムスタンプでキャッシュバスターを書き換えて `git add` し、コミットに含まれたことを確認。

