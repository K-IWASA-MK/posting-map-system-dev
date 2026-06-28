# 開発引き継ぎ事項 (更新: 2026-06-28)

次回の担当AIへ。以下のコンテキストを読み込み、これまでの開発履歴と現状を確認して作業を開始してください。

> **現担当AI**: Antigravity (Google DeepMind) — 2026-06-28 CIE Phase 45 (Plugin Runtime Event Replay Foundation) の実装を完了し、セッションイベントリプレイ構造を確立 ✅  
> **次回のテーマ**: 🧠 CIE Phase 46 (Plugin Runtime Event Snapshot Foundation) の構築およびテスト実装

---

## 🚀 Next Development Stage: Code Intelligence Engine Platform (Platform Phase)

### Platform Roadmap
* **Phase 16**: CLI Foundation [COMPLETED]
* **Phase 17**: Dashboard Foundation [COMPLETED]
* **Phase 18**: GitHub Actions Foundation [COMPLETED]
* **Phase 19**: AI Assistant Foundation [COMPLETED]
* **Phase 20**: CIE Platform v1.0 [COMPLETED]
* **Phase 21**: Config Management Engine [COMPLETED]
* **Phase 22**: System Summary Metrics [COMPLETED]
* **Phase 23**: System Data Exporter [COMPLETED]
* **Phase 24**: CIE Platform Integration [COMPLETED]
* **Phase 25**: Plugin Registry Foundation [COMPLETED]
* **Phase 26**: Plugin Runtime Foundation [COMPLETED]
* **Phase 27**: Plugin Lifecycle Foundation [COMPLETED]
* **Phase 28**: Plugin Dependency Foundation [COMPLETED]
* **Phase 29**: Plugin Scheduler Foundation [COMPLETED]
* **Phase 30**: Plugin Execution Plan Foundation [COMPLETED]
* **Phase 31**: Plugin Execution Engine Foundation [COMPLETED]
* **Phase 32**: Plugin Invocation Foundation [COMPLETED]
* **Phase 33**: Plugin Runtime Invocation Foundation [COMPLETED]
* **Phase 34**: Plugin Runtime Dispatcher Foundation [COMPLETED]
* **Phase 35**: Plugin Runtime Factory Foundation [COMPLETED]
* **Phase 36**: Plugin Runtime Session Foundation [COMPLETED]
* **Phase 37**: Plugin Runtime Session Lifecycle Foundation [COMPLETED]
* **Phase 38**: Plugin Runtime Session Event Foundation [COMPLETED]
* **Phase 39**: Plugin Runtime Event Store Foundation [COMPLETED]
* **Phase 40**: Plugin Runtime Event Query Foundation [COMPLETED]
* **Phase 41**: Plugin Runtime Event Index Foundation [COMPLETED]
* **Phase 42**: Plugin Runtime Event Catalog Foundation [COMPLETED]
* **Phase 43**: Plugin Runtime Event Metadata Foundation [COMPLETED]
* **Phase 44**: Plugin Runtime Event Analyzer Foundation [COMPLETED]
* **Phase 45**: Plugin Runtime Event Replay Foundation [COMPLETED]

### Platform Development Policy
* **No new Builder should be added unless absolutely necessary.**
* Future development should focus on:
  - **CLI** (Developer Experience & CI/CD command tool)
  - **Dashboard** (Repository Health Score & Visualizations)
  - **GitHub Actions** (CI/CD integration & Automated code scanning)
  - **AI Assistant** (Autonomous Agentic Refactoring interface)
  - **Developer Experience** (Enhancing diagnostic loops and developer velocity)

---

## 💎 Milestone

- **Tag**: `v3.8.0-alpha.0`
- **Title**: `Plugin Runtime Event Replay Foundation (Phase 45) Complete`
- **Status**:
  - `Plugin Runtime Event Replay Foundation Completed`
  - `Phase 46 (Plugin Runtime Event Snapshot) Started`

---

## 🛡️ Foundation Complete
CIE (Code Intelligence Engine) の基盤（Foundation）構築シリーズはすべて完了し、Orchestrator による一括統制が確立されました。

### Completed Components
- [x] **Asset Version Manager**: 静的アセットキャッシュバスターおよび Service Worker 同期自動化
- [x] **Asset Dependency Scanner**: HTML/SWとアセットの依存関係スキャナー (`asset_graph.json`)
- [x] **Execution Graph**: JavaScript関数定義・呼び出し構造静的スキャナー (`execution_graph.json`)
- [x] **Call Graph**: 逆方向関数呼び出し（Caller Index）解析器 (`call_graph_index.json`)
- [x] **Repository Index**: ファイル別関数・アセットリポジトリ索引 (`repository_index.json`)
- [x] **Knowledge Graph**: 各種スキャンデータを統合したセマンティックネットワーク (`knowledge_graph.json`)
- [x] **Semantic Layer**: 関数の機能的・意味的属性分類 (`semantic_layer.json`)
- [x] **Route Graph**: 画面遷移関係（Navigation系関数）の抽出・グラフ化 (`route_graph.json`)
- [x] **Data Flow**: 関数間データ伝播・依存フロー抽出器 (`data_flow.json`)
- [x] **Static Analysis**: 未使用・孤立・高影響・ハブ関数の静的抽出器 (`static_analysis.json`)
- [x] **Refactor Candidate**: 静的解析結果に基づく改善候補マッピング (`refactor_candidates.json`)
- [x] **Transformation Engine**: リファクタリング候補から具体的なコード変更計画の生成 (`transformation_plan.json`)
- [x] **Execution Engine**: 変更計画の実行順序・ブロック競合解決シミュレーター (`execution_plan.json`)
- [x] **Patch Generator**: 実行計画をプログラム化されたパッチデータへ変換 (`patch_plan.json`)
- [x] **Patch Apply Engine**: パッチの適用シミュレーション・一貫性チェック (`patch_apply_plan.json`)
- [x] **Rollback Engine**: 適用パッチを安全な逆順で差し戻すシミュレーター (`patch_rollback_plan.json`)
- [x] **CIE Orchestrator**: 全15ビルダーの順次実行・エラー制御およびサマリー出力 (`cie_orchestrator.py`)

---

## 🚀 次回タスク（旧）：管理者アプリのUIデザイン「プロ仕様」への昇華

### 背景と目的
本番のデモ環境を保護した上で、独立して検証できる「開発用環境（`dev`ブランチ、テスト用スプシ、テスト用GAS、テスト用LIFF ID、LINE Messaging API）」がすべて結合完了しました。
次回からは、**管理者アプリ（`manager.html`）のUIデザインのリニューアル**に本格着手します。

`AGENTS.md` の運用規範に基づき、以下の「超プレミアムな選挙DXプラットフォーム」にふさわしいデザインシステムを適用します。
- **漆黒背景 (#000000) と極上ガラスモーフィズム (backdrop-filter) の徹底**
- **微発光（グローエフェクト）と静かなアニメーション (200~400ms)**
- **Apple級のゆったりとした余白設計と直感的フォント**
- **LINE LIFF WebView（モバイル・スマホ片手操作）でのレスポンシブ崩れゼロの流動的構造**

---

## 🛠️ 現在構築済みの「開発・テスト用環境」パラメータ

| 項目 | 🎬 本番・デモ環境（`main` ブランチ） | 🛠️ 開発・検証環境（`dev` ブランチ） |
| :--- | :--- | :--- |
| **スプシ本体** | MIE-02 （四日市支部フォルダ内） | MIE-02 支部 ポスティングエリアマップ _開発用 |
| **スプシID** | `1gFM1GRmF-uMCBMzorwWEsMQcFnldbK9H6xS2th6K4QE` | `14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4` |
| **GASスクリプトID** | `1QV8N0NVYw3PBHuLSbQhgWC0FaLFFVGNaUx4lC13BTmZc...` | `158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmH...` |
| **Web AppデプロイID** | `AKfycbyoIK8marCDlhz8_Rr8H_rBtBeFUKw_9PcFKD0-0...` | `AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-...` |
| **配布員用LIFF ID** | `2010177345-h9Fjv1iU` | `2010177345-tXZIMAJK` |
| **管理者用LIFF ID** | `2010177345-h9Fjv1iU` | `2010177345-5y5ayk0h` |

* 開発環境用APIには、開発用のLINE Messaging API（チャネルシークレット・アクセストークン）がセキュアにバインド済みです。
* ローカルの開発ブランチ (`dev`) は、開発用GitHubリポジトリ（`K-IWASA-MK/posting-map-system-dev`）の `main` ブランチ（Pagesホスト）にプッシュされる構成になっています。

---


## ⚠️ 最重要：GAS Drive権限の教訓（2026-05-29 発生・解決済み）

### 何が起きたか
写真をGoogle Driveに保存する機能を実装したが、**何日経っても写真がDriveに届かなかった**。

### 根本原因
**GAS の OAuth スコープ固着問題**

```
① 最初のGASセットアップ時（Flash担当）
   → DriveApp を使うコードなし
   → 認証スコープ = Spreadsheets + Script のみ
   → appsscript.json にスコープ明示なし

② 後から DriveApp.createFile() を追加（写真機能）
   → clasp push + clasp deploy は成功
   → しかし既存の認証トークンがそのまま使われ続けた
   → Driveスコープが追加されたのに認証ダイアログが出なかった

③ 結果
   → DriveApp.Folder.createFile() を呼び出す権限がありません
   → 写真はIndexedDBに保存されるがDriveに届かない
```

### 解決手順
1. `appsscript.json` に `oauthScopes` を明示的に追加（**現在適用済み**）：
   ```json
   "oauthScopes": [
     "https://www.googleapis.com/auth/spreadsheets",
     "https://www.googleapis.com/auth/drive",
     "https://www.googleapis.com/auth/script.external_request",
     "https://www.googleapis.com/auth/userinfo.email"
   ]
   ```
2. `https://myaccount.google.com/permissions` で「ポスティングコード」の権限を全削除（リセット）
3. GASエディタで `authorizeAndTestDriveWrite()` を実行 → 全スコープ認証ダイアログ → 許可
4. `testDriveWrite` エンドポイントで確認 → `"Write OK"` ✅

### 今後の鉄則
**新しいGoogleサービスをGASに追加したとき（DriveApp, GmailApp, CalendarApp等）は必ず：**
1. `appsscript.json` の `oauthScopes` に追加
2. `myaccount.google.com/permissions` で古い認証を削除
3. GASエディタで再実行して再認証

**これを怠ると、コードは正しくてもAPIが黙って失敗し続ける。**

---


## 1. プロジェクト概要

- **フロントエンド**: GitHub Pages (`area-management.github.io/posting-map-system`)
- **管理者アプリ**: `area-management.github.io/posting-map-system/manager.html`
- **バックエンド**: Google Apps Script (GAS) API
- **現在のキャッシュバスター**: `v381`（service-worker.js 更新済み）
- **Gitブランチ**: `main`

---

## 2. これまでに完了した重要な変更点（直近）

### 【2026-06-28 セッション】CIE Phase 45 (Plugin Runtime Event Replay Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Analysis をもとに、イベントを決定論的に再構築・再生するための Runtime Event Replay Layer の Foundation を実装し、再生結果定義データ構造 (RuntimeEventReplay, EventReplayDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_replay/` パッケージを新設。
  - **モジュールの実装**: [event_replay_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_replay/event_replay_descriptor.py), [runtime_event_replay.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_replay/runtime_event_replay.py), [event_replay_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_replay/event_replay_registry.py), [event_replay_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_replay/event_replay_manager.py) の実装。トレースID整合性アサーションをクリアした上で、解析 ID から一意の再生 ID を決定論的にマッピング・生成し、固定再生種別 "default"、再生データは空オブジェクト `{}` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-replay` サブコマンドを追加。`runtime_event_analysis.json` をテスト用の暫定入力として読み込み、各結果から Analysis を復元・Managerへ渡して `runtime_event_replay.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_replay.json` を検証対象 (全34個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_replay/` 内のモジュール, [cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 44 (Plugin Runtime Event Analyzer Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Metadata を解析対象として扱う Runtime Event Analyzer Layer の Foundation を実装し、解析結果定義データ構造 (RuntimeEventAnalysis, EventAnalysisDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_analyzer/` パッケージを新設。
  - **モジュールの実装**: [event_analysis_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_analyzer/event_analysis_descriptor.py), [runtime_event_analysis.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_analyzer/runtime_event_analysis.py), [event_analysis_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_analyzer/event_analysis_registry.py), [event_analysis_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_analyzer/event_analysis_manager.py) の実装。トレースID整合性アサーションをクリアした上で、メタデータ ID から一意の解析 ID を決定論的にマッピング・生成し、固定解析種別 "default"、解析結果は空オブジェクト `{}` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-analysis` サブコマンドを追加。`runtime_event_metadata.json` をテスト用の暫定入力として読み込み、各結果から Metadata を復元・Managerへ渡して `runtime_event_analysis.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_analysis.json` を検証対象 (全33個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_analyzer/` 内のモジュール, [cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 43 (Plugin Runtime Event Metadata Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Catalog に格納されたイベントへ決定論的なメタデータを付与・保持する Runtime Event Metadata Layer の Foundation を実装し、メタデータ定義データ構造 (RuntimeEventMetadata, EventMetadataDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_metadata/` パッケージを新設。
  - **モジュールの実装**: [event_metadata_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_metadata/event_metadata_descriptor.py), [runtime_event_metadata.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_metadata/runtime_event_metadata.py), [event_metadata_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_metadata/event_metadata_registry.py), [event_metadata_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_metadata/event_metadata_manager.py) の実装。トレースID整合性アサーションをクリアした上で、カタログ ID から一意のメタデータ ID を決定論的にマッピング・生成し、固定メタデータ種別 "default"、属性オブジェクトは空ディクショナリ `{}` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-metadata` サブコマンドを追加。`runtime_event_catalog.json` をテスト用の暫定入力として読み込み、各結果から Catalog を復元・Managerへ渡して `runtime_event_metadata.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_metadata.json` を検証対象 (全32個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_metadata/` 内のモジュール, [cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 42 (Plugin Runtime Event Catalog Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Index を集約・分類・管理する Runtime Event Catalog Layer の Foundation を実装し、カタログ定義データ構造 (RuntimeEventCatalog, EventCatalogDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_catalog/` パッケージを新設。
  - **モジュールの実装**: [event_catalog_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_catalog/event_catalog_descriptor.py), [runtime_event_catalog.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_catalog/runtime_event_catalog.py), [event_catalog_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_catalog/event_catalog_registry.py), [event_catalog_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_catalog/event_catalog_manager.py) の実装。トレースID整合性アサーションをクリアした上で、インデックス ID から一意のカタログ ID を決定論的にマッピング・生成し、固定カタログ種別 "default"、エントリーは空リスト `[]` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-catalog` サブコマンドを追加。`runtime_event_index.json` をテスト用の暫定入力として読み込み、各結果から Index を復元・Managerへ渡して `runtime_event_catalog.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_catalog.json` を検証対象 (全31個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_catalog/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 41 (Plugin Runtime Event Index Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Query の結果を決定論的にインデックス化する Runtime Event Index Layer の Foundation を実装し、インデックス定義データ構造 (RuntimeEventIndex, EventIndexDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_index/` パッケージを新設。
  - **モジュールの実装**: [event_index_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_index/event_index_descriptor.py), [runtime_event_index.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_index/runtime_event_index.py), [event_index_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_index/event_index_registry.py), [event_index_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_index/event_index_manager.py) の実装。トレースID整合性アサーションをクリアした上で、クエリ ID から一意のインデックス ID を決定論的にマッピング・生成し、固定インデックス種別 "memory"、インデックスエントリーは空リスト `[]` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-index` サブコマンドを追加。`runtime_event_query.json` をテスト用の暫定入力として読み込み、各結果から Query を復元・Managerへ渡して `runtime_event_index.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_index.json` を検証対象 (全30個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_index/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 40 (Plugin Runtime Event Query Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Event Store に保持された Runtime Session Event を決定論的に検索・取得する Runtime Event Query Layer の Foundation を実装し、クエリ定義データ構造 (RuntimeEventQuery, EventQueryDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_query/` パッケージを新設。
  - **モジュールの実装**: [event_query_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_query/event_query_descriptor.py), [runtime_event_query.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_query/runtime_event_query.py), [event_query_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_query/event_query_registry.py), [event_query_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_query/event_query_manager.py) の実装。トレースID整合性アサーションをクリアした上で、ストア ID から一意のクエリ ID を決定論的にマッピング・生成し、固定クエリ種別 "lookup"、検索結果は空リスト `[]` で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-query` サブコマンドを追加。`runtime_event_store.json` をテスト用の暫定入力として読み込み、各結果から Store を復元・Managerへ渡して `runtime_event_query.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_query.json` を検証対象 (全29個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_query/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 39 (Plugin Runtime Event Store Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Session Event を永続的に保持・検索する Runtime Event Store Layer の Foundation を実装し、ストア定義データ構造 (RuntimeEventStore, EventStoreDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_event_store/` パッケージを新設。
  - **モジュールの実装**: [event_store_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_store/event_store_descriptor.py), [runtime_event_store.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_store/runtime_event_store.py), [event_store_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_store/event_store_registry.py), [event_store_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_event_store/event_store_manager.py) の実装。トレースID整合性アサーションをクリアした上で、イベント ID から一意のストア ID を決定論的にマッピング・生成し、固定ストレージ種別 "memory" で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event-store` サブコマンドを追加。`runtime_session_event.json` をテスト用の暫定入力として読み込み、各結果から Event を復元・Managerへ渡して `runtime_event_store.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_event_store.json` を検証対象 (全28個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_event_store/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 38 (Plugin Runtime Session Event Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Session Lifecycle に紐付く Session Event Layer の Foundation を実装し、イベントデータ構造 (RuntimeSessionEvent, EventDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_session_event/` パッケージを新設。
  - **モジュールの実装**: [event_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_event/event_descriptor.py), [runtime_session_event.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_event/runtime_session_event.py), [event_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_event/event_registry.py), [event_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_event/event_manager.py) の実装。トレースID整合性アサーションをクリアした上で、ライフサイクル ID から一意のイベント ID を決定論的にマッピング・生成し、固定イベント "initialized" で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-event` サブコマンドを追加。`runtime_session_lifecycle.json` をテスト用の暫定入力として読み込み、各結果から Lifecycle を復元・Managerへ渡して `runtime_session_event.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_session_event.json` を検証対象 (全27個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_session_event/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 37 (Plugin Runtime Session Lifecycle Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Session のライフサイクルを管理する Runtime Session Lifecycle Layer の Foundation を実装し、ライフサイクル定義データ構造 (RuntimeSessionLifecycle, LifecycleDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_session_lifecycle/` パッケージを新設。
  - **モジュールの実装**: [lifecycle_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_lifecycle/lifecycle_descriptor.py), [runtime_session_lifecycle.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_lifecycle/runtime_session_lifecycle.py), [lifecycle_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_lifecycle/lifecycle_registry.py), [lifecycle_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session_lifecycle/lifecycle_manager.py) の実装。トレースID整合性アサーションをクリアした上で、セッション ID から一意のライフサイクル ID を決定論的にマッピング・生成し、固定状態 "initialized" で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-lifecycle` サブコマンドを追加（既存の `lifecycle` コマンドとの衝突を回避）。`runtime_session.json` をテスト用の暫定入力として読み込み、各結果から Session を復元・Managerへ渡して `runtime_session_lifecycle.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_session_lifecycle.json` を検証対象 (全26個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_session_lifecycle/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 36 (Plugin Runtime Session Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Factory が生成した RuntimeInstance を実行単位として管理する Runtime Session Layer の Foundation を実装し、セッションデータ構造 (RuntimeSession, SessionDescriptor) とトレースID連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_session/` パッケージを新設。
  - **モジュールの実装**: [session_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session/session_descriptor.py), [runtime_session.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session/runtime_session.py), [session_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session/session_registry.py), [session_manager.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_session/session_manager.py) の実装。トレースID整合性アサーションをクリアした上で、インスタンスの ID から一意のセッション ID を決定論的にマッピング・生成し、固定状態 "initialized" で保持する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-session` サブコマンドを追加。`runtime_factory.json` をテスト用の暫定入力として読み込み、各結果から Instance を復元・Managerへ渡して `runtime_session.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_session.json` を検証対象 (全25個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_session/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 35 (Plugin Runtime Factory Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Dispatcher が選択した RuntimeDescriptor から Runtime インスタンス (RuntimeInstance) を決定論的に解決する Runtime Factory レイヤーの Foundation を実装し、実装定義 (RuntimeDefinition) とインスタンスのデータ構造およびトレース連鎖を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_factory/` パッケージを新設。
  - **モジュールの実装**: [runtime_definition.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_factory/runtime_definition.py), [runtime_instance.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_factory/runtime_instance.py), [runtime_provider.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_factory/runtime_provider.py), [runtime_factory.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_factory/runtime_factory.py) の実装。トレースID整合性アサーションをクリアした上で、記述子の runtime_id に適合するインスタンスを一意のIDマッピングで決定論的に生成する解決フローを確立。
  - **CLI (`cie.py`) の拡張**: `runtime-factory` サブコマンドを追加。`runtime_dispatch.json` をテスト用の暫定入力として読み込み、各結果から Descriptor を復元・Factoryへ渡して `runtime_factory.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_factory.json` を検証対象 (全24個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_factory/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 34 (Plugin Runtime Dispatcher Foundation) 構築（担当: Antigravity）
- **目的**: Runtime Adapter と各 Runtime 実装を接続する Runtime Dispatcher Layer の Foundation を実装し、要求 (RuntimeRequest) に適した記述子 (RuntimeDescriptor) を決定論的に選択して Trace 連鎖を引き継ぐ基礎を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_dispatcher/` パッケージを新設。
  - **モジュールの実装**: [runtime_descriptor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_dispatcher/runtime_descriptor.py), [runtime_registry.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_dispatcher/runtime_registry.py), [runtime_resolver.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_dispatcher/runtime_resolver.py), [runtime_dispatcher.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_dispatcher/runtime_dispatcher.py) の実装。Trace ID 整合性アサーションをクリアした上で、"Stub Runtime", "Default Runtime" を決定論的にマッチングし Trace_id を引き継いで解決する制御を確立。
  - **CLI (`cie.py`) の拡張**: `runtime-dispatch` サブコマンドを追加。`runtime_invocation.json` をテスト用の暫定入力として読み込み、各結果から RuntimeRequest を構成・Dispatcherへ渡して `runtime_dispatch.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_dispatch.json` を検証対象 (全23個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_dispatcher/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 33 (Plugin Runtime Invocation Foundation) 構築（担当: Antigravity）
- **目的**: Invocation Layer と Plugin Runtime を接続する Runtime Adapter Layer の Foundation を実装し、要求 (RuntimeRequest) を応答 (RuntimeResponse) へと決定論的 Stub でマッピング・解決する基礎を確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/runtime_adapter/` パッケージを新設。
  - **モジュールの実装**: [runtime_request.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_adapter/runtime_request.py), [runtime_response.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_adapter/runtime_response.py), [runtime_context.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_adapter/runtime_context.py), [runtime_adapter.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/runtime_adapter/runtime_adapter.py) の実装。Trace ID 整合性アサーションをクリアした上で、status "success" および決定論的 `duration: 0.0` の Stub 呼び出し変換制御を確立。
  - **CLI (`cie.py`) の拡張**: 既存の `runtime` との衝突を避けるため、`runtime-run` サブコマンドを追加。`plugin_invocation.json` をテスト用の暫定入力として読み込み、各結果から RuntimeRequest を構成・アダプタへ渡して `runtime_invocation.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/runtime_invocation.json` を検証対象 (全22個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/runtime_adapter/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 32 (Plugin Invocation Foundation) 構築（担当: Antigravity）
- **目的**: Execution Engine と Plugin Runtime を接続する Invocation Layer の Foundation を実装し、呼び出し要求 (PluginRequest) から結果 (PluginResponse) への Stub 解決および Trace の引き継ぎを一連のデータ構造として確立する。
- **実装内容**:
  - **新パッケージ**: `plugin_platform/plugin/invocation/` パッケージを新設。
  - **モジュールの実装**: [plugin_request.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/invocation/plugin_request.py), [plugin_response.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/invocation/plugin_response.py), [plugin_invocation.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/invocation/plugin_invocation.py), [plugin_invoker.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/invocation/plugin_invoker.py) の実装。Trace ID 整合性アサーションをクリアした上で、status "success" および決定論的 `duration: 0.0` の Stub 呼び出し制御を確立。
  - **CLI (`cie.py`) の拡張**: `invocation` サブコマンドを追加。`execution_result.json` をテスト用の暫定入力として読み込み、各結果から Request を復元・呼び出しを行って `plugin_invocation.json` を生成する処理を実装。
  - **verify & doctor の拡張**: `plugins/plugin_invocation.json` を検証対象 (全21個) に追加し、整合性合格を確認。
- **変更ファイル**: `plugin_platform/plugin/invocation/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-28 セッション】CIE Phase 30 & 31 (Plugin Execution Foundation) 構築（担当: Antigravity）
- **目的**: Pluginの実行計画 (Execution Plan) および実行エンジン (Execution Engine) の Foundation を構築し、決定論的な実行結果 (ExecutionResult) 生成パイプラインを確立する。
- **実装内容**:
  - **回避策の適用**: 標準ライブラリ `platform` との衝突を避けるため、新規ディレクトリ/パッケージを `plugin_platform` として追加。
  - **Phase 30 (Execution Plan)**: [execution_context.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_context.py), [execution_step.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_step.py), [execution_plan.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_plan.py), [execution_builder.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_builder.py) の実装。決定論的タイムスタンプの取得、Trace ID 整合性アサーション、依存関係順のソートを行い、生成のみに特化したBuilderを構築。
  - **Phase 31 (Execution Engine)**: [execution_result.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_result.py), [execution_executor.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_executor.py), [execution_engine.py](file:///Volumes/SSD_DATA/posting-map-system/plugin_platform/plugin/execution/execution_engine.py) の実装。実時間計測を一切行わない `duration: 0.0` 固定による決定論的かつダミーのPlugin順次実行制御を確立。
  - **CLI (`cie.py`) の拡張**: `execution` および `execution-run` サブコマンドを追加。シリアライズされた `execution_plan.json` および `execution_result.json` の出力をCLI側の責務として担当。これらを `JSON_ARTIFACTS` (全20個) に追加し、verify / doctor の合格を確認。
- **検証テスト**: `python3 tools/cie.py verify` および `doctor` での完全合格（Count: 20/20, Health: GOOD）を確認。
- **変更ファイル**: `plugin_platform/` 内のモジュール、[cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-27 セッション】CIE Phase 14 & 15 (Rollback / Orchestrator) 構築（担当: Antigravity）
- **目的**: パッチ適用の逆順シミュレーションを行うロールバックエンジンを構築し、全15ビルダーを依存関係順に一括実行するオーケストレータを実装してCIE基盤（Foundation）を完結させる。
- **実装内容**:
  - **Phase 14: Rollback Engine**: [rollback_engine_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/rollback_engine_builder.py) の作成。適用順の逆順でロールバックタスクをマッピングした [patch_rollback_plan.json](file:///Volumes/SSD_DATA/posting-map-system/tools/patch_rollback_plan.json) を生成。CandidateからRollbackまでを一貫追跡する `lifecycle` を導入。
  - **Phase 15: CIE Orchestrator**: [cie_orchestrator.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie_orchestrator.py) の作成。全15ビルダーの定数マニフェスト、`--from` オプション、`--dry-run` オプション、エラー時の中断、実行時間を含むサマリー表示を実装。
  - **AGENTS.md の更新**: 各ルールの明文化および追加。
- **検証テスト**: すべてのテスト（Coverage, Reverse Order, Lifecycle, Order, Dry Run, Summary 等）をクリア。
- **変更ファイル**: [rollback_engine_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/rollback_engine_builder.py), [cie_orchestrator.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie_orchestrator.py), [AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md)

### 【2026-06-26/27 セッション】CIE (Code Intelligence Engine) 基盤構築（Phase 6 〜 Phase 13）（担当: Antigravity）
- **目的**: リポジトリ全体の静的関係、遷移図、データフロー、およびAI自動リファクタリング計画までのパイプラインを定義・インデックス化する。
- **実装内容**:
  - **Phase 6: Route Graph**: [route_graph_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/route_graph_builder.py) の作成。Navigation カテゴリ関数の画面遷移図 [route_graph.json](file:///Volumes/SSD_DATA/posting-map-system/tools/route_graph.json) を生成。
  - **Phase 7: Data Flow**: [data_flow_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/data_flow_builder.py) の作成。関数間のデータ伝播経路 [data_flow.json](file:///Volumes/SSD_DATA/posting-map-system/tools/data_flow.json) を生成。
  - **Phase 8: AI Static Analysis**: [static_analysis_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/static_analysis_builder.py) の作成。未使用関数、孤立ルート、高影響関数、ハブ関数の静的解析結果 [static_analysis.json](file:///Volumes/SSD_DATA/posting-map-system/tools/static_analysis.json) を生成。
  - **Phase 9: Refactor Candidate**: [refactor_candidate_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/refactor_candidate_builder.py) の作成。改善候補 [refactor_candidates.json](file:///Volumes/SSD_DATA/posting-map-system/tools/refactor_candidates.json) を生成。
  - **Phase 10: Transformation Engine**: [transformation_plan_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/transformation_plan_builder.py) の作成。変更計画 [transformation_plan.json](file:///Volumes/SSD_DATA/posting-map-system/tools/transformation_plan.json) を生成。
  - **Phase 11: Execution Engine**: [execution_engine_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/execution_engine_builder.py) の作成。実行計画 [execution_plan.json](file:///Volumes/SSD_DATA/posting-map-system/tools/execution_plan.json) を生成。
  - **Phase 12: Patch Generator**: [patch_generator_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/patch_generator_builder.py) の作成。パッチメタデータ [patch_plan.json](file:///Volumes/SSD_DATA/posting-map-system/tools/patch_plan.json) を生成。
  - **Phase 13: Patch Apply Engine**: [patch_apply_engine_builder.py](file:///Volumes/SSD_DATA/posting-map-system/tools/patch_apply_engine_builder.py) の作成。適用シミュレーション [patch_apply_plan.json](file:///Volumes/SSD_DATA/posting-map-system/tools/patch_apply_plan.json) を生成。
- **検証テスト**: すべてのビルダーに対して、Coverage / Mapping / Distribution / Sequential ID / Stability などの徹底的な検証テストをクリアし、一貫性を保証。
- **変更ファイル**: 各ビルダースクリプト、JSONデータ、[AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md), [HANDOVER.md](file:///Volumes/SSD_DATA/posting-map-system/HANDOVER.md)

### 【2026-06-04 セッション】ランキングバッジ中央揃え修正 (v381)（担当: Claude Sonnet）
- **不具合事象**: ランキング画面の1位〜3位および本人バッジの「N位」テキストが中央揃えになっておらず、左寄りに見えていた。
- **根本原因**: グロードット（`●`）が `mr-2` でflexレイアウト内に配置されていたため、テキストが右にオフセットされていた。
- **対策 (render.js)**: グロードットを `position: absolute; left: 10px` に変更してflexレイアウトから切り離し、「N位」テキストが常にバッジ中央に来るよう修正。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】テンキーOK後の裏画面チラつき修正 (v380)（担当: Claude Sonnet）
- **不具合事象**: 枚数を入れてOKを押すとカメラが起動するが、その直前に一瞬だけ裏の詳細画面が見えていた。
- **根本原因**: `closeNumpad()` でテンキーを閉じてから `capturePhoto()` を呼ぶ順序だったため、OSがカメラを起動するまでの数十ms間、裏画面が見えてしまっていた。v365以前から存在する構造的な問題。
- **対策 (app.js)**: `capturePhoto()` の呼び出しを `closeNumpad()` より前に移動。`input.click()` は同期的に実行されるため、カメラが起動してからテンキーが閉じる順序になり裏画面が見えなくなる。GPS取得も同タイミングで並行開始。
- **修正ファイル**: `app.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】カメラ起動不具合の修正（並行フロー復元 + GPSリトライ） (v379)（担当: Claude Sonnet）
- **不具合事象**: テンキーでOKを押してもカメラが起動しなくなっていた（v378のFlash実装による）。
- **根本原因**: v378でGPS取得を `await` で先に完了させてからカメラを起動するシーケンシャル処理に変更されたため、iOS Safariのユーザーアクション制限（タップから約1秒以内に `input.click()` を呼ばないとカメラが開かない仕様）に抵触していた。
- **対策 (app.js)**: v376の並行フローを復元。GPS取得とカメラ起動を同時に開始し、カメラ復帰後にGPS結果を待つ。GPS未取得の場合はカメラ復帰後にリトライ。`window.blobToBase64` への修正はそのまま維持。
- **修正ファイル**: `app.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】GPS・写真データ消失バグの完全解決（シーケンシャル処理化） (v378)（担当: Gemini 3.5 Flash）
- **不具合事象**: 新規テスト登録を行っても、GPSと写真がスプレッドシートに記録されない問題が依然として発生していた。
- **原因**: `app.js` 側で `typeof blobToBase64` と `window.` を付けずに参照していたため、Base64変換がスキップされていた。
- **対策**: `typeof window.blobToBase64 === 'function'` に修正。ただし並行処理をシーケンシャルに変更したため、カメラが起動しない副作用が発生（v379で解決済み）。
- **修正ファイル**: `app.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】カメラ起動前の詳細モーダルフライング描画の削除 (v377)（担当: Gemini 3.5 Flash）
- **不具合事象**: テンキーで枚数を入れて確定（OK）した直後、カメラ起動に移る前に、一瞬だけ裏画面（詳細モーダル）が未完了または中途半端な証跡なし（NO GPS / NO PHOTO）の状態で再描画されて見えてしまうチラつき・ガタつきが発生。
- **原因**: `app.js` 内の `pressNum` 関数において、カメラを起動して証跡を取得し終わる前の段階で、`renderDetailModalContent(p)` を呼び出して詳細モーダルをフライング描画してしまっていた。
- **対策**: カメラ起動前の詳細モーダル再描画処理を削除。カメラから復帰してGPS座標と写真が確定したタイミングで初めて詳細モーダルを描画するように順序を整理し、チラつきのない滑らかな遷移に修正。
- **修正ファイル**: `app.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】詳細画面のGPS・写真消失バグの修正 & 写真追加ボタン削除 (v376)（担当: Gemini 3.5 Flash）
- **不具合事象**: 配布完了したはずのデータの詳細モーダルを開き直すと「NO GPS DATA」や「NO EVIDENCE PHOTO」と表示されてしまうバグが発生。また、完了画面に余分な「写真を追加」ボタンが残っていた。
- **根本原因**: 
  1. `app.js` 内で写真BlobをBase64に変換する `blobToBase64` が `db.js` のローカル関数として宣言されていたため、`app.js` からは `undefined` となり写真データのエンコード・送信処理が常にスキップされていた。
  2. カメラ起動中のサスペンドにより、先行して動かしていたGPS Promiseが復帰時にタイムアウトエラーを起こし、空座標で送信されていた。
- **対策**:
  - **対策1 (db.js & app.js)**: `blobToBase64` 関数を `window.blobToBase64` としてグローバル定義に変更し、`app.js` で正しく画像Base64データを生成できるように修正。
  - **対策2 (app.js)**: カメラから復帰した際にGPSが空だった場合のフォールバック（リトライ）処理を追加し、復帰後に確実に現在地を取得。
  - **対策3 (render.js)**: 完了済み詳細画面の写真表示ロジックから不要な「📸 写真を追加」ボタンを完全に削除し、「NO EVIDENCE PHOTO」というシンプルな証跡なしステータス表示のみに統一。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v376` にインクリメント。
- **修正ファイル**: `render.js`, `app.js`, `db.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】2層目Google Mapsボタンの `<a>` タグ化とUniversal Links完全対応 (v375)（担当: Gemini 3.5 Flash）
- **不具合事象**: 2層目のGoogle Maps連携ボタンをUniversal Links形式（`?api=1&query=`）に修正したにもかかわらず、スマホのLINE LIFF（アプリ内WebView）等でマップを開く際に、再び「アップグレード/アプリ誘導モーダル」が表示されてしまう。
- **根本原因**: 3層目は `<a>` タグによるアンカー遷移を行っていたのに対し、2層目は `<button>` の `window.open` (JavaScript) を使っていた。スマホのOSやLINEはセキュリティや仕様上の制限から、JavaScript起動の画面遷移時はUniversal Links（アプリ起動）を意図的に無視し、WebView内で強引にWebページとして開くため、アップグレード画面が出ていた。
- **対策**: 2層目のGoogle Maps連携ボタンも3層目と同じく `<a>` タグ（`href="..." target="_blank"`）によるアンカー遷移へ統一。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】2層目Google Maps連携リンクのUniversal Link形式修正 (v374)（担当: Gemini 3.5 Flash）
- **不具合事象**: エリア一覧（2層目）のGoogle Maps連携ボタンをタップした際、アプリが直接起動せずWeb版Google Mapsの「アップグレード/アプリ誘導モーダル」が立ち上がる現象が発生していた。
- **原因**: 2層目で生成されるURLが、Google公式のユニバーサルリンク形式（`https://www.google.com/maps/search/?api=1&query=...`）ではなく、非公式なパス形式（`https://www.google.com/maps/search/...`）になっていたため、OSがアプリ用リンクとして検知できなかった。
- **対策**: 2層目のGoogle Maps連携URLを、3層目と同じ公式のユニバーサルリンク形式（`?api=1&query=`）に統一。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】エリア完了カードのダブルロックとバグ修正 (v373)（担当: Gemini 3.5 Flash）
- **不具合事象**: エリア一覧（2層目）で完了（`10/10` など 100%）したエリアカードにロックが掛かっておらずタップ可能であり、完了時の `🔒` バッジでデザインが崩れていた。また、`render.js` 編集時の記述重複により JavaScript 構文エラーが発生していた。
- **対策**:
  - `render.js` の `}).join('');` の重複を削除して構文エラーを解消。
  - バッジ内のテキストを `🔒` のみとし、余白を調整して改行崩れを防止。
  - 完了時のカードにおいて、「Google Maps 連携ボタン」と「配布詳細へ ➔ ボタン」の両方に `opacity-40` および `pointer-events: none` を設定し、ダブルロック状態を実現。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v373` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】順位カプセルバッジのインラインスタイル修正 (v372)（担当: Gemini 3.5 Flash）
- **不具合事象**: 前セッションで `min-w-[76px]` クラスを適用したものの、実機でバッジ幅が広がらず、二桁対応できないまま狭く潰れた円形になっていた。
- **原因**: プロジェクトの `tailwind-utils.css` が静的にビルドされたものであるため、新しく指定した `min-w-[76px]` という TailwindCSS クラス定義が物理的に存在せず、ブラウザに無視されていた。
- **対策**:
  - `render.js` 内の順位バッジに、Tailwind クラスではなく直接 `style="min-width: 76px;"` のインラインスタイルを指定。これにより確実に 76px 幅が適用されるように修正。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v372` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】順位カプセルバッジの最小横幅（min-w）設定と整列化（担当: Gemini 3.5 Flash）
- **変更内容**:
  - 配布ランキング画面の順位バッジに `min-w-[76px]` の最小横幅制限を設定。
  - これにより、1位から2桁順位（例: `10位` や `12位`）まで、バッジの形状が歪まず綺麗な横長カプセル型を維持するよう改善。
  - リスト全体の縦軸のラインが揃い、デザインの対称性と視認性が向上。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v371` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】GPS/写真証跡の確実な取得とメモリ同期バグ修正（担当: Gemini 3.5 Flash）
- **不具合事象**: モバイル環境（LINE WebView等）で写真とGPSの両方を取得したにもかかわらず、提出前の詳細画面で「NO GPS DATA」「NO EVIDENCE PHOTO」と表示されてしまう。
- **根本原因**: 
  1. カメラ起動中にブラウザがサスペンドし、復帰直後にGPS取得を行うとタイムアウト等で位置情報取得が失敗し、空データが送信されていた。
  2. GASへの送信（同期）成功時、メモリデータ（`allPoints`）への「GPS情報」の再同期が漏れていたため、キューから消えるとGPSが表示されなくなっていた。
  3. `triggerUISyncRefresh` にてIndexedDBキューの同期状況を判定する際の変数名不一致（`found.status` と `found.syncStatus` のズレ）。
- **修正内容**:
  - **対策1 (app.js)**: テンキー「OK」タップ時に、カメラ起動よりも先行してバックグラウンドでGPS取得を開始（Promiseを先行生成）。カメラから復帰した際に取得済みの結果を待つようにし、サスペンドによるタイムアウトを回避。
  - **対策2 (db.js)**: API送信成功時、メモリデータ（`p.gps`）にも送信成功した緯度経度を同期するように追加。
  - **対策3 (app.js)**: 同期状況のステータス監視プロパティ名を `found.syncStatus || found.status` に修正。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v370` にインクリメント。
- **修正ファイル**: `app.js`, `db.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】ランキングリスト項目の3行構成・中央揃え化（担当: Gemini 3.5 Flash）
- **変更内容**:
  - 配布ランキング画面のランキング一覧の各行（カード）を中央揃えの3行構成に変更。
    - 1行目: 順位バッジ（ドットライト & `○○位` のカプセルバッジ）
    - 2行目: 配布員名（余分な `YOU` バッジは完全に削除しシンプル化）
    - 3行目: 配布枚数（`text-lg` で `○○,○○○枚` の形式）
  - `index.html` および `service-worker.js` のキャッシュバスターを `v369` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】マイステータスカードの3行目「配布数」への差し替え（担当: Gemini 3.5 Flash）
- **変更内容**:
  - 配布ランキング画面の「My Performance（本人のステータス）カード」の3行目の内容を「現在の順位」から「現在までの配布数」に差し替え。
    - 1行目: `My Performance`
    - 2行目: 自分の名前（`text-lg`）
    - 3行目: 現在までの配布数（緑色のカプセル型バッジ内に `現在までの配布数 : ○○,○○○枚` の形式で格納。5桁の枚数が入るスペースを考慮）
  - `index.html` および `service-worker.js` のキャッシュバスターを `v368` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】マイステータスカードの3行構成・中央揃え化（担当: Gemini 3.5 Flash）
- **変更内容**:
  - 配布ランキング画面の「My Performance（本人のステータス）カード」を中央揃えの3行構成に変更。
    - 1行目: `My Performance`（緑小文字）
    - 2行目: 自分の名前（`text-lg`）
    - 3行目: 現在の順位（緑色のカプセル型バッジ内に `現在の順位 : 1位` の形式で格納）
  - `index.html` および `service-worker.js` のキャッシュバスターを `v367` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-04 セッション】ランキングヘッダーカードのUI統一（担当: Gemini 3.5 Flash）
- **変更内容**:
  - 配布ランキングのヘッダーカード（青枠）から `LEADERBOARD` というテキストを削除。
  - アイコンの枠サイズを `w-12 h-12` から `w-8 h-8`（SVGも `w-6 h-6` から `w-4 h-4`）へ縮小。
  - 外枠の padding を `p-6` から `py-5 px-6` に変更し、下部マージン等を「全体エリア」カードと完全に揃えることで、縦幅（高さ）をミリピクセル単位で統一。
  - `index.html` および `service-worker.js` のキャッシュバスターを `v366` にインクリメント。
- **修正ファイル**: `render.js`, `index.html`, `service-worker.js`

### 【2026-06-03 セッション】配布員アプリ UI 改善（担当: Sonnet）

#### ① 2層目エリアカード — 2ボタン化・郵便番号マップ機能追加
- **変更前**: カード全体タップ → 3層目へ遷移
- **変更後**:
  - カード全体タップを廃止
  - `inline-flex flex-col align-items:stretch` 構造でカード全コンテンツを包み、**上段・下段ボタンが自動で同幅**になる設計に変更
  - **上段ボタン**: `📮 〒518-0001 → 🗺`（タップで郵便番号検索の Google Maps を開く）
  - **下段ボタン**: `配布詳細へ →`（3層目へ遷移）
  - 郵便番号バッジの重複表示を削除（上段ボタンに統合）
- **修正ファイル**: `render.js`（2層目カード HTML 全面再構成）

#### ② 3層目完了カード — タップ無効ロック修正
- **問題**: Sonnet の前セッションにて「GPS確認のため全カードタップ可能」に変更されていた
- **修正**: 完了済みカード（`p.isDone === true`）は `clickable-card` クラス・`onclick` を削除してタップ無効に戻した
- **修正ファイル**: `render.js`（line 467〜469）

#### ③ AI行動指針の確認・遵守宣言
- **AGENTS.md の行動指針（承認なき実行禁止）を確認**
- 今後は「提案 → 承認（Yes/OK）→ 実装」の順を厳守する

---

### ① 大容量POST通信（写真アップロード）のタイムアウト延長とアラート廃止 (v364)
- **要望**: 写真などのアップロード中にタイムアウトエラー（Fetch is aborted）が発生した際、警告アラートダイアログが表示されてアプリの操作スレッドが完全に停止（フリーズ）してしまう問題を防ぐ。
- **対策**:
  - `app.js` 内の `callApiPost` のタイムアウト時間を30秒から **90秒** に延長し、GASやGoogleドライブの書き込み遅延に対応しました。
  - 最大リトライ数に達した際に出力されていた `alert()` を完全に削除しました。送信エラー時はアラートを出さずに IndexedDB 送信キュー（`db.js`）を介してバックグラウンドで自動的にリトライ（再送信）されるため、現場配布員の画面操作を一切停止させないオフラインファーストの設計に変更しました。
  - `index.html` の各ファイルキャッシュバスターを `v=364` に更新しました。

### ② 3層目（詳細画面）配布枚数表示カードを青色テーマ＆カード幅・枠サイズ統一 (v363)
- **要望**: 配布枚数表示カードを、上2つの証拠提出用カード（GPS / 写真）と同じ青色テーマ・枠サイズに統一する。
- **対策**:
  - `render.js` 内の枚数表示カードのサイズを `w-full rounded-2xl py-4 px-5` に統一しました。
  - カードの背景・枠線・影および文字色（`text-[#2563eb]`）を、上2枚のカードと完全に同一の青色スタイル（`border: 1.5px solid rgba(37, 99, 235, 0.4);` 等）に統一し、証拠データ全体の表示デザインを一本化しました。
  - `index.html` の各ファイルキャッシュバスターを `v=363` に更新しました。

### ② 3層目（詳細画面）GPS VERIFIEDバッジのカード化（フルサイズ・青色テーマ統一） (v362)
- **要望**: `GPS VERIFIED` バッジを `📍 GPS VERIFIED` に変更し、他のカードと横幅を揃える。また、色とフォントサイズを `PHOTO VERIFIED` と同じ青色スタイルに統一する。
- **対策**:
  - `render.js` 内の `gpsBadgeHtml` を丸型のインラインバッジから横幅いっぱいの `w-full` カード型に変更し、絵文字 `📍` を追加しました。
  - カードの背景・枠線・影および文字サイズ（`text-[10px] font-black text-[#2563eb]`）を、すぐ下にある `PHOTO VERIFIED` カードと完全に同一の青色スタイル（`border: 1.5px solid rgba(37, 99, 235, 0.4);` 等）に統一しました。
  - `index.html` の各ファイルキャッシュバスターを `v=362` に更新しました。

### ② 3層目（詳細画面）完了カード内の不要なチェックボックス削除 (v361)
- **要望**: `MISSION COMPLETED`（完了済み）カード内にある不要なチェックボックス（緑色背景＋白チェック）を削除する（画面全体のチェックアイコン重複を防止するため）。
- **対策**:
  - `render.js` 内の `MISSION COMPLETED` カードから、チェックボックスを描画していたHTMLブロックのみを完全に削除しました。カード全体のレイアウト（余白や外枠のCSSクラス）は一切変更せず保持しています。
  - `index.html` の各ファイルキャッシュバスターを `v=361` に更新しました。

### ② 3層目（詳細画面）配布枚数表示カードの文字サイズ統一 (v360)
- **要望**: 配布枚数表示カード内の「配布数」「数値」「枚」の文字サイズを、すべて数値と同じ大きなサイズに統一する。
- **対策**:
  - `render.js` 内の枚数表示部分を `text-3xl font-black text-white text-center` の単一テキスト要素（`配布数 ${p.count || 0}枚`）に変更し、全体が均一に大きく表示されるようにレイアウトを統一しました。
  - `index.html` の各ファイルキャッシュバスターを `v=360` に更新しました。

### ③ 3層目（詳細画面）配布枚数表示カード内に「配布数」ラベルを横並びで追加 (v359)
- **要望**: 枚数表示カードの数値の手前に「配布数」という文言を追加する。
- **対策**:
  - `render.js` 内の枚数表示コンテナのレイアウトを `flex items-baseline justify-center gap-2` に変更し、数値の手前に `配布数` ラベル（`text-xs font-bold text-white/60`）を配置しました。これにより、ベースラインを揃えた `配布数 80枚` という美しい一列のレイアウトを実現しました。
  - `index.html` の各ファイルキャッシュバスターを `v=359` に更新しました。

### ② 3層目（詳細画面）PHOTO VERIFIEDカードの「写真を変更」ボタン廃止と外枠の青色化 (v358)
- **要望**: 写真撮影完了後に表示される `PHOTO VERIFIED` カードから、「写真を変更」ボタンを削除する（ボタンによるカードの縦幅増加で画面上部が見切れる問題を防ぐため）。また、カードの外枠をテーマ色の青にする。
- **対策**:
  - `render.js` 内の `PHOTO VERIFIED` カードのスタイルに、青色枠線（`border: 1.5px solid rgba(37, 99, 235, 0.4);`）および極小シャドウを設定し、内部の「写真を変更」ボタンを削除してレイアウトをコンパクト化しました。
  - `index.html` の各ファイルキャッシュバスターを `v=358` に更新しました。

### ③ 3層目（詳細画面）未完了カードと完了済みカード of チェックボックスデザイン統一 (v357)
- **要望**: 未完了状態（`READY TO DEPLOY`）と完了状態（`MISSION COMPLETED`）で、チェックボックスの見た目を完全に統一する。
- **対策**:
  - `render.js` の未完了状態のチェックボックス（`border-color: rgba(16, 185, 129, 0.4); background-color: rgba(16, 185, 129, 0.06);` および不透明度 20% の checkmark）を、完了状態のチェックボックスと全く同一の**ソリッドな緑色塗りつぶし背景（`background-color: #10b981;`）および白色のチェックマーク（`text-white`）**に統一。
  - `index.html` にて、`style.css`, `db.js`, `app.js`, `render.js` のキャッシュバスターを `v=357` に更新。

### ② 3層目（詳細画面）カメラのジェスチャーブロックバグの解消、写真確認カードの青色維持とボタン・アイコン常時表示化 (v356)
- **事象**: 
  - テンキーで「OK」を押した際、GPS情報取得（非同期の geolocation 待ち）がカメラ起動より先に行われていたため、ブラウザの「タップ操作のジェスチャー時間制限」を超過し、`input.click()` がポップアップブロックされていた。
  - 完了報告直後の提出（閉じる）までのモーダル画面において、写真が未撮影の場合に「📸 写真を追加」ボタンが非表示になり、カメラアイコンが消失し、再撮影が不可能な状態になっていた。
- **対策**:
  - `pressNum('OK')` において、**写真撮影（カメラ起動）を最優先で同期実行**するように順序を入れ替え、ジェスチャーを失うことなくカメラが確実に起動するように修正。
  - 詳細画面が完了報告でロックされる前（提出前）にいつでも写真を撮影・変更できるよう、写真の追加・変更ボタンを常時表示。また、「NO EVIDENCE PHOTO」時のカメラアイコン `📸` を維持。
  - 写真カード（およびボタン）のカラーテーマは、デザイン要件に従って「青（#2563eb）テーマ」をそのまま維持。

### ② 3層目（詳細画面）配布完了カードのシンメトリー化・操作性・質感の向上 (v355)
- **事象**: 「タップで配布完了」の操作カード内チェックボックスが小さな正方形であり、未完了時に空洞だったため余白と状態色の設計が崩れていた。また、タップ領域が狭く高齢配布員の操作性を損ねていた。
- **対策**:
  - カード全体を `<label>` で囲み、カード全体のどこをタップしても反応するように変更。タップ時の物理的スケールダウンを `active:scale-[0.95] active:translate-y-0.5` に強化し、物理的なコクッという沈み込み（クリックフィードバック）を実現。
  - 未完了時のチェックボックス枠線を上品なグリーン（`rgba(16, 185, 129, 0.4)`）に設定し、空洞感を解消するために半透明のグリーンチェックマークシルエット（`text-[#10b981]/20`）をあらかじめ配置。
  - 完了時は上品な発光グリーンで `🔒 MISSION COMPLETED` と完了情報を中央揃えで綺麗に並べるようにし、完璧な縦軸の対称性（シンメトリー）を持つ余白設計へと改善。

### ② 3層目（詳細画面）スライドイン操作カードUIの実装（v313）
- **事象**: 「GPS自動取得」や「証拠写真のアップロード機能（IndexedDB同期）」を実装したものの、スマホのUI（3層目のリスト画面）上でそれを確認・操作する要素（ボタンやステータス表示）が一切なく、見た目が以前と全く変わっていなかった。
- **対策**:
  - **初期表示のシンプル化**: 3層目の住所リストは、住所と進捗ドットだけのスマートな1行ガラスカード型に統合。
  - **詳細操作モーダルの新設**: 住所タップ時に画面下部から極上のスライドモーダル（他のモーダルと一貫したデザイン）が立ち上がるように設計。
  - **GPS・写真の可視化**: 完了したカード内に「`📍 GPS SECURED`」や「`📸 PHOTO SENT`」などのバッジを美しく表示し、写真が無い場合は「`📸 写真を追加`」ボタンからいつでも後から追記撮影・送信ができるように実装。
  - **リアクティブUIの実現**: テンキー完了時、写真の追加時、 IndexedDB の送信完了（同期）時に、リストと詳細モーダルの両方が即時に動的再描画されるように同期制御を構築。

### ② キャッシュ同期の早期リターンバグ修正（v290）
- **事象**: 「エリアすべて削除（リセット）」を行っても、スマホ画面（Webアプリ）に古い市町村（名張市など）が表示され続ける問題が発生。
- **原因**: `refreshAreaSummaryCache()` にて、データが0件（リセット直後）のときに早期リターンしていたため、キャッシュ（`CacheService`）やグローバルプロパティ（`PropertiesService`）のクリア処理がスキップされていた。
- **対策**: 早期リターンを廃止し、データが0件の場合でも空の結果をキャッシュに上書き保存するように修正。これにより、リセット時にスマホの表示も即座に完全にクリアされるように改善。

### ③ 一時シート（__TEMP_ADDRESSES__）によるバッチ高速化・安定化（v290）
- **事象**: 巨大な郵便番号CSV（数万行）の展開負荷が高く、バッチ処理が数分でタイムアウトして停止し、後半のシート（名張市や亀山市など）が作成されなかった。
- **対策**: 
  - `forceStartBatch()` 実行時に一度だけCSVをパースし、ソートした住所を非表示の一時シート `__TEMP_ADDRESSES__` に保存。
  - バッチ再開時（トリガー実行時）はCSVを読まずにこの一時シートからロードするようにし、処理速度を10倍以上向上（タイムアウトを完全防止）。完了時に一時シートは自動削除される。
  - 住所データを市町村名で日本語ソートしてから処理することで、同一市町村のシートが細切れに作成されるのを防ぎ、1枚目から綺麗にデータが入るように改善。

### ④ 郵便番号カナを用いた動的五十音順ソートの導入（v291）
- **事象**: 日本語の五十音順ソートに `localeCompare` をそのまま適用した際、文字コード順（JIS順）に引っ張られてしまい、「伊賀➔亀山➔四日市➔名張➔鈴鹿」という日本語として誤った順序でシートが作られていた。
- **対策**: 
  - 郵便番号CSVから「市町村の漢字名 ➔ カタカナ読み仮名（半角カナから全角に変換）」のマップを動的に生成。
  - 住所ソート時にこのカタカナ読み仮名を用いて五十音順比較を行うよう変更。これにより、特定の市町村名に依存したハードコーディング（固定値）を一切排除し、**日本全国どの選挙区であっても動的に完全に正しい五十音順（伊賀➔亀山➔鈴鹿➔名張➔四日市）でソート・シート作成される**ように改善。

### ⑤ 今後のスマホ機能追加における「スプシ非表示」設計方針（v291）
- **重要ルール**: ポスティング管理者にスプレッドシート（生データ）は一切渡さず、スマホアプリ（PWA）および司令室マップだけで完結させる運用方針です。
- そのため、今後スマホ側に新しいカードや追加機能（例: スマホ側でのカード新規作成・登録機能など）を構築する際は、**スプレッドシート上に新しいシートタブを増やさず、非表示のデータベースシートに行データとして裏で非表示処理する設計**を徹底してください。

---

## 3. 運用上の最重要警告・注意事項

### 🚨 GAS変更時のデプロイ必須手順
- `clasp push` を行っただけでは、本番の Webアプリ に変更が反映されません。
- 変更後は、必ず以下のコマンドを実行して**デプロイIDを固定してデプロイを更新**してください。
  ```bash
  npx clasp deploy -i AKfycbyoIK8marCDlhz8_Rr8H_rBtBeFUKw_9PcFKD0-0xQgmeV8CmDAT3hqrgu3f35CFH0O
  ```
- これを行わないと、APIは古いバージョンのロジックで動作し続けます。

---

## 4. デザイン保護・固定ルール（変更禁止事項）

- **上部ヘッダー**: `px-6` の横幅および `gap-3` レイアウトが確定版（変更禁止）。
- **ONLINEインジケーター**: `animate-soft-pulse` による1.5秒の微パルスが確定版（変更禁止）。
- **設定画面スクロール固定**: スクロール不可の固定レイアウト（変更禁止）。

---

## 5. 【NEW 2026-06-09 合意】ボトムナビ「純白アクティブ」化＆現場統制OSへのロードマップ

### ① ボトムナビのアクティブ「純白」輝度差デザインへの統一 (v418) - 適用済み
- 画面内で「青」や「緑」のステータスが多く使われているため、ナビゲーションの競合を避ける目的で、アクティブ時のカラー表示を**「純白（`#ffffff`、`opacity-100`）」**、非アクティブ時は**「透過白（`text-white/40`、`opacity-40`）」**の輝度差のみで美しく表現する極上デザインへ統一しました（管理者・配布員双方）。
- インラインの直接的な `opacity` 操作を廃止し、Tailwind CSS の `classList` に依存する綺麗なクラス制御に移行。

### ② 今後の機能方針：LINE URL（LIFF）販売モデルに沿った現場統制設計 (次回以降)
支部長はスプシの存在すら知らないIT素人であり、販売するのは「LINEのURL（LIFF）」であるため、すべてアプリ上のUIとLINEの標準接続機能だけで完結する仕様にします。

#### 1. ボトムナビの「トップ画面 ⇄ メニュー」の2層トグル構成
スマホ画面のスペース不足と高齢配布員の誤タップを防ぐため、ボタンは4つに保ち、右端の `⚙️メニュー` を押すと左3つのボタンがシュッと切り替わるフリップ式を採用します。
- **トップ画面**（通常時のメインUI）：
  - `📍 戦略マップ` | `📦 保管庫` | `📊 レポート`
- **メニュー画面**（トグル時）：
  - `🚚 チラシ流通` | `👥 配布員管理` | `🛠️ 設定/ログ`

#### 2. 📍 戦略マップ上の「ここに行ってくれ」LINE連絡機能
- 管理者がマップ上で進捗が遅れている「赤いエリア」をタップする。
- その情報ウィンドウにオプションで置かれた `[💬 配布を打診]` ボタンを押すと、ID登録されている配布員の名簿がその場にポップアップ。
- 人を選んで `[💬 連絡]` を押すと、公式LINE経由で「名張市桔梗が丘の配布をお願いできますか？」と最初の打診メッセージ（きっかけ）が送信される。
- あとは普通にLINEのチャット上で人間同士が会話して調整する（余計な自動ステータス同期等の複雑な処理は一切入れない）。

#### 3. 📦 チラシ保管庫の「プルダウン＋テンキー」掲示板
- 山田さんなどの保管者が、アプリ上で「保管場所（プルダウン選択：四日市市/鈴鹿市など）」「枚数（テンキー入力）」を入れて登録するだけのシンプルなチラシ保管掲示板。
- 保管者自身の名前（ID）は、ログインセッションから自動で取得して裏でセットするため入力不要。
- サポーターはこれを見て、お互い個人IDを登録していなくても、公式LINEを通じて直接チャットを起動して連絡をとる。

---

## 🧠 Code Intelligence Engine (CIE) ロードマップ (更新: 2026-06-27)

### Foundation (基盤整備)
* **[x] Asset Version Manager**: アセット更新時のキャッシュバスター自動インクリメント・Service Worker自動同期・Gitステージングの完全自動化。
* **[x] Asset Dependency Scanner**: アセットとHTML/Service Worker間の依存関係の静的解析および `asset_graph.json` データベースの自動生成。
* **[x] Execution Graph Scanner (Phase 1)**: JavaScriptの関数定義と呼び出し関係を静的解析し、決定論的な `execution_graph.json` を自動生成する基盤の構築。
* **[x] Call Graph Index (Phase 2)**: 逆方向の関数呼び出し関係（Caller Index）を自動解析・生成し、関数の影響範囲を特定する基盤の構築。
* **[x] Repository Index (Phase 3)**: ファイル別に関数・アセット・HTML などの関係性を紐解き、AI が「どこに何があるか」を一瞬で逆引き検索できるインデックスの構築。
* **[x] Knowledge Graph (Phase 4)**: Repository Index, Execution Graph, Call Graph, Asset Graph などをすべて統合し、コードベース全体の意味的ネットワーク（Knowledge Graph）を形成。
* **[x] Semantic Layer (Phase 5)**: Knowledge Graph に対して静的キーワード分類を適用し、関数の意味情報（Initialization, Storage など）を付加する基盤の構築。

---

### Phase 6: Route Graph (Phase 6)
* **[x] Route Graph (Phase 6)**: 意味分類された関数群（Navigation）の関係を統合し、アプリケーション全体の画面遷移構造を可視化する基盤の構築。

### Phase 7: Data Flow (Phase 7)
* **[x] Data Flow (Phase 7)**: 既存の Knowledge Graph と Route Graph を統合し、関数間のデータ伝播（Data Flow）経路を表現・可視化する基盤の構築。

### Phase 8: AI Static Analysis Foundation (Phase 8)
* **[x] AI Static Analysis Foundation (Phase 8)**: LLMを使用せず、既存の各種 Graph を用いて、未使用関数候補、孤立ルート候補、影響範囲候補などを静的に抽出するエンジンの構築。

### Phase 9: Refactor Candidate Foundation (Phase 9)
* **[x] Refactor Candidate Foundation (Phase 9)**: コードの書き換えは行わず、静的解析結果（Analysis）から各リファクタリング候補（Refactor Candidate）を安全にマッピング・生成する基盤の構築。

### Phase 10: Transformation Engine Foundation (Phase 10)
* **[x] Transformation Engine Foundation (Phase 10)**: コードの変更は行わず、改善候補（Refactor Candidate）から具体的なプログラム変更計画（Transformation Plan）へと安全に変換するレイヤーの構築。

### Phase 11: Execution Engine Foundation (Phase 11)
* **[x] Execution Engine Foundation (Phase 11)**: コード変更は行わず、実際の変更適用シミュレーション、実行順序の決定、依存関係・競合チェック、実行可否判定のみを行うレイヤーの構築。

### Phase 12: Patch Generator Foundation (Phase 12)
* **[x] Patch Generator Foundation (Phase 12)**: コードの書き換えは行わず、実行計画（Execution Plan）に基づき、変更操作を構造化したパッチデータ（Patch Data）を生成するレイヤーの構築。

### Phase 13: Patch Apply Engine Foundation (Phase 13)
* **[x] Patch Apply Engine Foundation (Phase 13)**: コード変更は行わず、パッチデータ（Patch Data）に基づく変更適用シミュレーション、変更前後の一貫性検証、競合チェックのみを行うレイヤーの構築。

### Phase 14: Rollback Engine Foundation
* **目的**: コードの変更は行わず、パッチデータ（Patch Data）に基づき、安全に元の状態へ差し戻すロールバックシミュレーション、一貫性検証、実行可能順序の判定のみを行うレイヤーの構築。
