# Google Drive Standard Folder Structure Specification
## FIELD OPERATIONS PLATFORM 標準Google Drive構成定義書

Version: 1.9
Author: Quality Management / UIUX Design / Security Departments
Date: 2026-07-05

---

## 1. FIELD OPERATIONS PLATFORM Google Drive Principles

Google Driveは単なる「ストレージ」ではなく、FIELD OPERATIONS PLATFORMの標準データ基盤として以下の原則のもとで厳格に運用されます。

1. **Google Drive = 保存**
2. **Google Sheets = 管理**
3. **Dashboard = 可視化**
4. **LIFF = 入力**
5. **Google Sheetsを利用者へ意識させない。**
6. **フォルダ名は変更しない。**
7. **番号順を維持する。**
8. **Archive以外へ不要データを保存しない。**

---

## 2. OS型統合構造移行ルール (OS Integration & Migration Rules)

現在のプロジェクト分散構造から「OS型統合構造」へ移行するため、ルート直下は `FIELD_OPERATIONS_PLATFORM/` のみとし、以下の移行・マッピングルールを厳格に適用します。

### 🚨 移行絶対ルール
1. **ルート直下の新規作成禁止**: ルート直下に新規で個別プロジェクトフォルダを作成することを永久に禁止します。
2. **01〜99 体系の厳守**: すべてのデータ・アセットはいずれかの標準コードフォルダ配下に分類します。
3. **日本語フォルダの禁止**: フォルダ名およびパス名に日本語を使用することを禁止します（移行時の一時退避を除く）。
4. **DEV環境の統合**: 開発用・検証用（DEV）フォルダは、独立させず `03_BRANCH` 配下に統合して管理します。
5. **Single Source of Truth**: Google Driveを唯一の正本（正データ基盤）と定義します。

### 🔄 旧フォルダのマッピングルール

| 旧フォルダ名 / カテゴリ | 移行先フォルダ | 備考 / 詳細 |
|---|---|---|
| `MASTER` / `地域データ` / `郵便番号` / `マスタCSV` / `テンプレート` | `01_MASTER/` | 変更頻度の低い基礎データとして集約 |
| `POSTING_MAP_SYSTEM` / `Apps Script` / `API` / `設定ファイル` / `AIOS関連` | `02_SYSTEM/` | system稼働に必要な構成定義 |
| `POSTING MAP MIE-03 (DEV)` / 各支部データ | `03_BRANCH/` | `県 / 支部 / 単位` 構造へ再配置 |
| `POSTING_MAP_STORAGE` / 画像 / PDF / CSV / JSON / 動画 | `04_STORAGE/` | ユーザーアップロードデータ領域 |
| 旧スプレッドシート / 手動バックアップ / エクスポートデータ | `05_BACKUP/` | バージョン管理およびバックアップ退避 |
| ダッシュボード関連ファイル / 可視化データ / レポート | `06_DASHBOARD/` | 各種可視化システム連携用データ・構成 |
| 操作マニュアル / FAQ / 導入資料 / メールテンプレート | `07_MANUAL/` | 導入・運用のための手引きドキュメント |
| 旧データ / 破棄予定データ / 旧構成フォルダ | `99_ARCHIVE/` | アーカイブ・コールドストレージ領域 |

---

## 3. Googleアカウント統合ルール & AIOS認証固定プロトコル (Google Account & Auth Protocol)

### 3-1. 単一アカウント原則 (Single Account Principle - 最重要)
FIELD OPERATIONS PLATFORMの正本Googleアカウント（システムマスターアカウント）は以下に完全固定します。
```
SYSTEM MASTER ACCOUNT: postingareamap@gmail.com
```
その他のGoogleアカウントは以下の扱いとします：
- **READ ONLY**: 参照のみ許可
- **TEST**: 検証・デバッグ時のみ許可
- **禁止**: いかなる書き込み・Drive操作も不可

### 3-2. Google Drive 操作・認可ルール (Drive Authority Rule)
Google Driveを操作する際は、必ず以下の条件をすべて満たさなければなりません：
- **SYSTEM MASTER ACCOUNT**（`postingareamap@gmail.com`）でログイン（またはAPI認証）されていること。
- Drive API操作の対象は、上記アカウントが所有するリソースに限定。
- 他アカウントの個人用Driveのデータ参照・マウントは一切禁止。

### 3-3. コンテキスト固定ルール (Context Fix Rule)
AIおよびシステムコンテキストは、常に以下の値を保持しなければなりません：
```python
CURRENT ACTIVE ACCOUNT = "postingareamap@gmail.com"
CURRENT DRIVE ROOT     = "FIELD_OPERATIONS_PLATFORM"
```
上記コンテキスト情報が未確定、または不一致の場合は、**すべてのDrive操作およびファイル連携処理を即座に安全停止（STOP ALL OPERATIONS）**します。

### 3-4. システム状態の完全固定定義 (System Locked State)
本システムおよび認証エージェントは、以下のパラメータ定義を唯一の動作基準とし、例外的な動作や代替動作（Fallback）を完全に排除します。
- **ACTIVE DRIVE ROOT ID**: `1FfcVEQjod--rZSucOPFJD2DJ58hV650_`
- **ACTIVE ACCOUNT**: `postingareamap@gmail.com`
- **SYSTEM MODE**: `LOCKED (NO FALLBACK)`
- **既存データ扱い**: 過去に個人アカウントや暫定アカウント等に作成されたフォルダ・ファイル資産は、本OSプラットフォームにおいて一切無効（非公式データ）として扱います。

---

## 4. 実行責任層 (Execution Authority Layer)

「誰が実行し、誰が保証するか」の実行責任境界を明確にし、「作ったつもり問題」や「アカウント不一致」を防ぐため、実行責任レイヤーを以下の役割に分離して固定します。

### 4-1. 役割の明確な分離 (Roles Separation)
システムにおける役割を以下の通り明確に分離します。
- **AIOS（設計・指示）= Brain**: 
  - システム構造の設計、操作指示の策定。
  - AI自身はGoogle Drive APIの直接操作（接続およびデータ更新）を行わない。
- **Flash / Antigravity（実行エンジン）= Hands**:
  - APIトークンの解決、物理層（Google Drive API）との接続、および実動作のトリガー。
  - 指示に従ったフォルダ生成、README作成、ファイル保存の実処理を担当。
- **Google Drive API（物理層）= Memory**:
  - クラウド上の物理的ファイル・フォルダ実態の保存先。
- **Verify（検証レイヤー）= Eyes**:
  - APIからの応答ではなく、実フォルダの再スキャン・存在確認・整合性検証を担う。

### 4-2. 実行保証ルール (Execution Guarantee Rules)
実行エンジン（Flash）は、Drive操作時に以下の5フェーズを例外なくシーケンシャルに実行し、その成否を保証しなければなりません。

1. **指示受信 (Command Receive)**: AIOSからのリファクタリング・作成指示を解釈。
2. **実行ログ生成 (Audit Logging)**: 操作前の状態、実行内容、実行パラメータ（対象アカウント等）を監査ログに記録。
3. **Drive操作実行 (Physical Execution)**: Masterアカウント認証を用いてGoogle Drive APIへの操作要求を送信。
4. **結果返却 (Result Return)**: 処理成否および生成されたリソースIDを返却。
5. **VERIFY返却 (Verification Return)**: 別途実行された検証層（Eyes）による実在再スキャンの整合性結果を返却。

---

## 5. 実行強制ガードプロトコル (Execution Guard Protocol - 暴走遮断層)

実行エンジンの実装バグやAIエージェントの指示解釈ミス（暴走）による誤操作・環境汚染を物理的に遮断するため、以下のガードプロトコルをシステム・ツール実行の最前面に組み込みます。

### 5-1. 実行前強制ゲートチェック (Pre-Execution Forced Gate)
すべての物理的Driveアクセス（フォルダ作成、削除、ファイル書き込みなど）のAPIリクエストが送出される直前に、実行エンジン（Flash）は以下の検証を強制適用します。

- **Check 1 (Google Account Verification)**: APIアクセストークンに関連づけられたメールアドレスが `postingareamap@gmail.com` と完全一致すること。
- **Check 2 (Drive Root ID Verification)**: 操作対象の親ディレクトリツリーの再上流が `1FfcVEQjod--rZSucOPFJD2DJ58hV650_` と完全一致すること。
- **Check 3 (Token Origin Validation)**: トークン取得元（OAuthソース）の真正性が検証可能であること。

### 5-2. 不一致検知時の動作 (Abort & Block Actions)
上記のチェック項目が1点でも不一致となった場合、実行エンジン（Flash）は以下のアクションを強制実行します：
1. **即時実行停止 (STOP EXECUTION)**: 呼び出しプログラムに例外（Critical Exception）をスローし、プロセスを即座にキルする。
2. **API送出の物理遮断 (NO DRIVE CALL)**: Google Drive APIへのリクエストを一切生成・送出せず、接続コネクタを無効化する。
3. **エラーステートの返却 (RETURN ERROR STATE)**: AIOSおよび実行管理画面に対して「`SECURITY_AUTH_GUARD_TRIGGERED`」のエラーステートおよびログを即時返却し、管理者にアラート通知する。

### 5-3. 二重Drive（非認可複製）の自動検出 (Duplicate Clone Protection)
もし同一のマスターアカウントまたは他アカウントの参照権限付き領域において、別のルートIDを持つ `FIELD_OPERATIONS_PLATFORM` フォルダ（二重定義構造）を自動検出した場合、以下の処理を行います：
- 対象リソースを「**UNAUTHORIZED CLONE（非認可クローン）**」として識別・マークし、システム管理ログに記録。
- 当該フォルダおよび配下データへの同期・書込み（Sync/Write）処理を**一切拒否 (DO NOT SYNC)** し、データの分散・書き間違いを物理的に阻止します。

---

## 6. 論理実行制御レイヤー & 誤操作防止ルールエンジン (Logical Execution Control Layer & Rule Engine)

Google Drive APIなどのHTTPS APIエンドポイントにおける現実的制約に対応するため、定義されたガードポリシーを「論理実行制御レイヤー」としてAPIラッパー（SDK）層にバインドし、プログラムレベルで物理通信の発生を強制制御します。

### 6-1. 全APIコールのラッパー・プロキシ化 (API Wrapper Hook)
システム、IDE（Antigravity）、または実行エンジン（Flash）から送出されるすべてのGoogle Drive APIコールは、生のHTTPリクエストを直接発行することを禁止します。必ず共通の **「API Guard Wrapper（論理ゲート）」** を通過する設計とし、ラッパー内でGuardポリシーの適合を強制チェックします。

```
[Antigravity / Flash / GAS Engine]
               │
               ▼ (API Action Request)
    ┌──────────────────────┐
    │  API Guard Wrapper   │ ◄── [Checks: Account, Root ID, Token]
    └──────────────────────┘
               │
       ┌───────┴───────┐
       ▼ (PASS)        ▼ (FAIL)
  [HTTP Request Send] [Exception Thrown & Blocked]
       │               │
       ▼ (Network)     ▼ (Zero Network Traffic)
  [Google Drive]  [HTTPS Connection Never Opened]
```

### 6-2. 論理的リクエスト遮断と物理通信の未生成化 (Logical Request Abort)
チェック項目（アカウント・ルートID・トークン）に不一致が生じた場合、ラッパーライブラリは**HTTPS接続のコネクション（TCP/TLSハンドシェイク）を開く前に例外を発生（Abort）**させ、APIリクエスト自体の生成を論理的に遮断します。これにより、間違ったアカウントやディレクトリへの不正なデータ送出は物理的ネットワークトラフィックの発生前に完全に防止されます。

### 6-3. 例外のない事前実行条件 (Guard as a Hard Precondition)
この「論理実行制御レイヤー」はオプションやスキップパラメータを一切許容しない事前実行条件（Hard Precondition）として実装されます。
- **誤操作防止ルールエンジン**: AIや開発ツール自身が誤った操作を行おうとした際、このラッパーエンジンが例外をスローして強制終了するため、本番アカウントデータへの誤書き込みや不要なノイズデータの生成を完全に遮断します。

---

## 7. フォルダツリー構造およびリソースID (Folder Tree & Resource IDs)

```
FIELD_OPERATIONS_PLATFORM/ (ID: 1FfcVEQjod--rZSucOPFJD2DJ58hV650_)
├── 01_MASTER/ (ID: 1opFkqEQfDjC0au-1qp0lAMQZh8XalVin)    # 変更頻度の低い基礎データ
├── 02_SYSTEM/ (ID: 1VGNuHSJdpStp-7vsZk69yZjyXcb6Q1yY)    # システム連携設定・構成定義
├── 03_BRANCH/ (ID: 1EQQqWbtyF7iMd7Fk-WnUwWiAGB4MdIdN)    # 各支部の配布状況管理用スプレッドシート
│   └── [Prefecture]/     # 例: MIE (三重県連)
│       └── [Branch]/     # 例: MIE-03 (支部)
│           ├── DEV/      # 開発・検証用環境
│           └── PROD/     # 本番用環境
├── 04_STORAGE/ (ID: 1FyM4wCIqWJovbcsMZ6h9JKFQxhgwciGb)    # ユーザーアップロードデータ（大容量メディア・ファイル）
├── 05_BACKUP/ (ID: 1mt_q0G9bGfM6F3arcBAlQbMkax0MQlgT)     # データ・構成ファイルの定期バックアップ
├── 06_DASHBOARD/ (ID: 1BgaTFZZ5YBDg1ML3yVU1KkiDIXrJ_Z_s)  # Dashboard関連ファイル（可視化用データソース）
├── 07_MANUAL/ (ID: 1IZtErEbkmGIjwSjQZLKleHZIh8ihLdVZ)     # 利用マニュアル・トラブルシューティング
└── 99_ARCHIVE/ (ID: 1dXGvifv6YE59f9QGSHUGwO2caf4rql0M)    # 過去の活動データ・古い資料の退避先
```

---

## 8. 各フォルダ詳細定義

### 📂 01_MASTER
- **役割**: システム全体および組織全体の変更頻度の低い基礎データ（マスターデータ）の管理
- **保存対象**:
  - 行政データ、地域データ、郵便番号データ
  - テンプレートファイル
  - 初期設定ファイル、マスタCSV
  - 統一エリアマスター（全国・県連・ブロック・支部対応のマスターシート）
  - ライセンス・アカウント管理マスター
- **保存禁止データ**:
  - 日々の配布ログ（支部データ）
  - 各種バックアップファイル
  - 写真・画像などのバイナリファイル（04_STORAGEへ）
- **命名規則**: `MASTER_[データ名]_v[バージョン]`
- **運用ルール**:
  1. 本部管理者のみが編集権限を持つ（ブロック・県連・支部は閲覧専用）。
  2. 変更時は必ず本部の品質管理部（AI総監督含む）の承認を必須とし、変更履歴シートに記録する。

### 📂 02_SYSTEM
- **役割**: システム連携、API設定、システム稼働状況および運用構成ファイルの管理
- **保存対象**:
  - システム設定シート（APIエンドポイント、LIFF IDマッピングなど）
  - リソース定義、アセット管理インデックス（JSON形式、設定等）
  - clasp連携等の開発設定
- **保存禁止データ**:
  - 個人情報（配布員の名前や連絡先など）
  - 日常の配布ログ
  - マスターデータ原本
- **命名規則**: `SYSTEM_[設定名]_[環境]`
- **運用ルール**:
  1. 開発部およびセキュリティ管理者のみが書き込み可能。
  2. 本番環境（PROD）の変更時は、二重チェックを行い、検証環境（DEV）での動作確認完了後に反映する。

### 📂 03_BRANCH
- **役割**: 支部ごとの配布活動、現場状況、個別設定の管理
- **保存対象**:
  - 支部個別スプレッドシート（配布進捗、エリア担当者割り当て）
  - 支部内配布活動集計データ
  - 支部独自の設定資料
- **保存禁止データ**:
  - 配布員の撮影した現地の写真（写真は04_STORAGEへ）
  - 全システム共通マスターデータ
  - システムバックアップ
- **命名規則**: `BRANCH_[支部ID]_[データ名]`
- **運用ルール**:
  1. 各支部の運用担当者および本部に編集権限を付与。他支部からは閲覧不可とする。
  2. スプレッドシートは直接編集せず、原則として管理者アプリ（Kアプリ）または配布員アプリ（Hアプリ）経由で更新する。

### 📂 04_STORAGE
- **役割**: ユーザーアップロードデータの保存（大容量メディアや各種添付ファイル）
- **保存対象**:
  - ユーザーアップロードデータ（写真、動画、PDF、CSV、JSON、ZIPなど）
  - 配布完了時の現場撮影写真・エビデンス画像
  - 配布物（チラシ・広報誌）のPDF/画像原本
- **保存禁止データ**:
  - システム設定ファイルやプログラムコード
  - 個人情報が含まれる無関係な画像
- **命名規則**: `STORAGE_[支部ID]_[日付]_[配布員ID]_[画像・ファイル用途]_[通番]`
- **運用ルール**:
  1. 写真はアプリから直接Google Cloud Storageまたは指定 of Driveフォルダに自動アップロードする。
  2. 手動でのアップロードは禁止し、定期的にアーカイブ（99_ARCHIVE）に退避してアクティブフォルダの容量を一定に保つ。

### 📂 05_BACKUP
- **役割**: システムデータ、データベース、設定 of 定期・変更前バックアップ
- **保存対象**:
  - 支部Spreadsheet of 定期コピー（デイリー/ウィークリー）
  - マスターデータ・設定ファイルのバージョンバックアップ
- **保存禁止データ**:
  - 写真・動画などのメディアファイル
  - 日常で使用するアクティブなファイル（直接編集禁止）
- **命名規則**: `BACKUP_[対象名]_[日付時間]`
- **運用ルール**:
  1. 自動スクリプトまたは管理者によるデプロイ・更新前に必ず作成する。
  2. 保存期間は30日間とし、それを超えたものは自動または手動で削除、もしくはアーカイブへ移動する。

### 📂 06_DASHBOARD
- **役割**: 意思決定・可視化のためのダッシュボード構成、レポート、営業フック用データの管理
- **保存対象**:
  - Dashboard関連ファイル（Looker Studio、React/Next.js Dashboard、Chart.js、ECharts用構成ファイル等）
  - 報告書・レポート用データ（サマリーデータ）
  - 営業用デモデータ、デモDashboard設定
- **保存禁止データ**:
  - 現場の生写真
  - 生の個別配布ログ（アグリゲーション後のサマリーデータのみを推奨）
- **命名規則**: `DASHBOARD_[対象階層]_[範囲ID]_[更新日]`
- **運用ルール**:
  1. 可見化ツールやダッシュボードとの連携用データソースとなるため、カラム構造の変更は厳禁とする。
  2. 意思決定者への「3秒で状況が伝わる」デザイン要件を満たしたレポートテンプレートや構成ファイルのみを配置する。

### 📂 07_MANUAL
- **役割**: 配布員、管理者、支部、本部向けの操作手順書および運用の手引きの管理
- **保存対象**:
  - Hアプリ（配布員用）利用マニュアル（PDF、画像）
  - Kアプリ（管理者用）管理・操作マニュアル
  - トラブルシューティングガイド
- **保存禁止データ**:
  - 実データ、稼働ログ
  - バックアップファイル
- **命名規則**: `MANUAL_[対象]_[用途]_v[バージョン]`
- **運用ルール**:
  1. 常に最新版のみを配置し、古いバージョンは99_ARCHIVEに移動する。
  2. 高齢の配布員でも直感的に理解できるよう、画像やイラストを多用したマニュアルとする。

### 📂 99_ARCHIVE
- **役割**: 過去の活動データ、古い設定、保管期限の切れたマニュアル・写真などの退避・保存
- **保存対象**:
  - 過去の選挙・配布活動 of 完了済みスプレッドシート
  - 旧バージョンの設定ファイル、バックアップ
  - 旧版マニュアル
- **保存禁止データ**:
  - 現在進行中のアクティブなプロジェクトデータ
- **命名規則**: `ARCHIVE_[元カテゴリ]_[元ファイル名]_[アーカイブ日]`
- **運用ルール**:
  1. 読み取り専用とし、いかなる場合もアクティブな書き込み・更新を行わない。
  2. 容量削減のため、3年以上経過したデータは外部のコールドストレージ等への移行を検討する。
