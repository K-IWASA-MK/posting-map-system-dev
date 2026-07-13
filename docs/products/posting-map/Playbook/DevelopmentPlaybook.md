# FIELD OPERATIONS PLATFORM - Development Playbook
## 開発標準作業手順書 (Standard Operating Procedure: SOP)

Version: 1.0
Last Updated: 2026-07-05

---

## 1. はじめに

本プレイブックは、FIELD OPERATIONS OS / POSTING MAPの開発プロセスにおいて、人間開発者およびAIエージェント（Claude Code、Antigravity等）が同じ品質・同じ手順で機能追加・バグ修正を行うための標準作業手順書（SOP）です。

---

## 2. 開発ワークフロー（SOP 8ステップ）

すべての開発は、以下の8つのフェーズを厳格に順守して実行されます。

```
[1. 仕様書確認] ──> [2. 設計・計画] ──> [3. AIエージェント指示]
                                                   │
[6. Gitコミット] <── [5. LIFF実機検証] <── [4. Chrome DevTools検証]
       │
[7. プッシュ＆デプロイ] ──> [8. リリース完了報告]
```

### ステージ 1: 仕様書確認 (Specification Check)
作業を開始する前に、必ず関連する仕様書を以下の優先順位で読み込み、開発思想の不整合を防ぎます。
1. **[ProductConcept.md](file:///Volumes/SSD_DATA/posting-map-system/docs/concepts/ProductConcept.md)**: 全体の設計原則（Principles）に抵触していないか確認。
2. **[AIOSDevelopmentArchitecture.md](file:///Volumes/SSD_DATA/posting-map-system/docs/architecture/AIOSDevelopmentArchitecture.md)**: 開発ルールおよび優先ロードマップを確認。
3. **[DashboardDesignGuide.md](file:///Volumes/SSD_DATA/posting-map-system/docs/concepts/DashboardDesignGuide.md)** (Dashboard変更時) または **[LIFFDevelopmentGuide.md](file:///Volumes/SSD_DATA/posting-map-system/docs/architecture/LIFFDevelopmentGuide.md)** (スマホアプリ変更時): デザイン・実装原則を確認。

### ステージ 2: 設計・計画 (Implementation Planning)
* **タスクの書き出し**: 実装する内容をステップ単位で明確にした計画書（`implementation_plan.md`）を作成します。
* **承認(GO)の獲得**: `AGENTS.md` の「🚨 承認なき実行の絶対禁止」ルールに従い、計画段階の差分や方針を岩佐CEOに提示し、承認（Yes/OK）を得てからファイル操作へ進みます。
* **TODOリスト作成**: 承認後、作業用のTODOリスト `task.md` を作成して進行状況を管理します。

### ステージ 3: AIエージェントへの指示 (AI Prompting)
AIエージェントにコード作成や変更を指示する際は、以下の構成でプロンプトを与えます。
1. **前提原則の共有**: 例：「`Google Sheetsの存在を利用者に意識させないこと`」「`3秒で伝わるグラフにすること`」など、設計原則から該当項目を指名して提示します。
2. **変更範囲の限定**: 編集すべきファイルパスを明確に指定し、不要なファイルリファクタリングを防止します。
3. **エッジケース指定**: Null/Undefined、初回起動時（レコード0件）のハンドリングを必ず処理に組み込むよう指示します。

### ステージ 4: Chrome DevTools 検証 (Chrome Audit)
コード適用後、PCのChromeブラウザを用いて以下の一次検証を行います。
* **Consoleパネル**: JSエラーや警告、未処理の例外が0件であることを確認。
* **Networkパネル**: APIリクエストが重複して実行されていないか、GAS呼び出しが最小限に抑えられているか確認。
* **Performanceパネル**: レンダリングブロックがなく、1秒以内で初期描画が完了しているか確認。

### ステージ 5: LIFF実機検証 (LIFF Device Verification)
「ブラウザで動く ≠ LIFFで動く」の原則に基づき、開発用LIFF（またはテストURL）を実機のLINEアプリから起動して検証します。
* **検証項目**: 
  * 端末のWebView特有のヘッダー・フッターによるレイアウト崩れがないか。
  * `backdrop-filter` などのCSSエフェクトが正しくレンダリングされているか。
  * キャッシュがクリアされた状態で正常に初回ロードが完了するか。

### ステージ 6: Git コミット (Git Commit)
* **コミットのクリーン化**: 不要なバックアップファイル、一時ファイル、`console.log` 等のデバッグ行が残っていないか `git status` で厳格にチェックします。
* **コミットメッセージ**: `CIE Phase <N>: <Name>` などのプロジェクト規則に従い、1つの変更責務ごとにコミットを作成します。

### ステージ 7: プッシュ＆デプロイ (Push & Deploy)
* **リモートリポジトリの使い分け**:
  * 開発・変更は常に **`origin-dev`**（`K-IWASA-MK/posting-map-system-dev`）の `main` ブランチに対してプッシュします。
  * `git push origin-dev HEAD:main`
  * ※本番リポジトリ（`origin`）への直接プッシュは人間管理者のみが行うため、AIは絶対にプッシュしてはなりません。

### ステージ 8: リリース完了報告 (Handover & Report)
* **walkthrough.md** を作成または更新し、検証結果（実機確認結果、ログ）をまとめます。
* チャット欄への出力まとめルールに従い、完了報告とGitログを「1つのコードブロック」にまとめて記述し、岩佐CEOに報告してフェーズを終了します。
