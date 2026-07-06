# Release Notes - v4.6-workflow-engine

## 🚀 New Features & Enhancements

### 1. Workflow Engine Foundation 完成 (AIOS Phase 136)
- **並列タスクルーティング制御 (`parallelGroups`)**:
  - 先行の `TSK-0001` 完了後、依存する複数の並列タスク（`TSK-0002` と `TSK-0003`）を同時に活性化・アサインさせる並列グラフ解決機能を実装。
- **Merge Gate (マージゲート) 機能**:
  - 指定された全開発タスク（`TSK-0002`, `TSK-0003`）が完了するまで、最終リリースフェーズ（`TSK-0004`）のアサインをロックする不整合制御。ゲートにロック解除条件や理由を明示的に保持。
- **Workflow Integrity Audit (不整合監査システム)**:
  - `--audit` コマンドにより、閉路探索(DFS)を用いた循環依存（無限ループ）、デッドロック、タスクの欠落、マージゲート不整合を検出し、ビルドやプロジェクト実行前に未然に防ぐ品質ゲートを構築。
- **Task State Machine (状態遷移マシン) の厳格化**:
  - `TODO` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `UNDER_REVIEW` ➔ `COMPLETED` 等の状態遷移ルールを定義。完了後のステータス逆行や不正ステップをガード。
- **Orchestration Event History (監査イベントログ) の構築 (`tools/orchestrator_events.json`)**:
  - 各レコードに `eventVersion: "1.0.0"` を持たせ、アサインやリトライ、フォールバック、ステータス変更の全遷移履歴をタイムスタンプ付きで記録。

---

# Release Notes - v4.5-ai-team-orchestration

## 🚀 New Features & Enhancements

### 1. AI Team Orchestrator Foundation 完成 (AIOS Phase 135)
- **Agent Registry の独立化 (`tools/ai_agents.json`)**:
  - AIモデルのアサイン可否、役割、および得意分野（`capabilities`：UI, GAS, Architecture 等）を管理する能力プロファイルを品質データと分離して定義。
- **タスク依存関係制御 (`dependsOn`)**:
  - 先行するタスクIDが `COMPLETED` になるまでアサインをロックする制約を追加。
- **最適AIモデルの自動マッチングと選定理由 (`assignmentReason`)**:
  - タスクの要求カテゴリに応じて適合するエージェントを自動選別し、さらに `ai_quality_report.json` 内で最もパフォーマンスが高いモデルをマッチング。アサイン理由を客観的メトリクスと共にログに記録。
- **リトライ管理 (`retryCount`) とエージェントの自動スイッチ（フォールバック）**:
  - レビューに3回以上連続で失敗した際、アサイン対象を他の適合エージェントに自動的に切り替えて警告を発生させるフォールバックシステムを実装。
- **ハンドオーバー仕様のバージョン管理 (`handoverVersion: "1.0.0"`)**:
  - レビュー失敗時の違反情報および self-healing 用の nextAction を引き渡す `tools/ai_handover.json` をバージョン管理付きで自動生成。

---

# Release Notes - v4.4-ai-continuous-improvement

## 🚀 New Features & Enhancements

### 1. AI Continuous Improvement Foundation 完成 (AIOS Phase 134)
- **構造化された Action Recommendations の自動生成**:
  - ルール違反の発生傾向を分析し、重要度・ステータス（`OPEN`）・根拠（`basedOn`：件数やそのカテゴリの合格率）を定義した機械的に処理可能な修正アドバイスを動的に出力。
- **Quality Score 構成要素の細分化**:
  - スコア算出式（`Score = 100 - errorPenalty - warningPenalty`）を明確に定義し、計算の透明性と追跡性を保持。
- **Trend Analysis (多層タイムウィンドウ)**:
  - 短期（`last10`）、中期（`last30`）、および長期（`overall`）の合格率を分離して追跡し、品質トレンドの変遷を記録。
- **Rule Heatmap (エラーヒートマップ) 可視化**:
  - ルールID（001〜010）ごとの違反件数を集計し、コンソール上に `■` を使ったヒートマップグラフを出力するダッシュボード機能を統合。

---

# Release Notes - v4.2-multi-ai-review

## 🚀 New Features & Enhancements

### 1. Multi-AI Review Orchestration Foundation 完成 (AIOS Phase 132)
- **エージェント識別メタデータの統合**: 
  - 成果物を提出したAIモデルを特定・追跡するための構造体（`agentId`, `agentName`, `agentRole`）をレビュー結果に統合。
- **3段階のレビュー検証ステータス**:
  - レビューの検証結果を `PASS` (違反0), `PASS_WITH_WARNING` (警告のみ), `FAILED` (エラーあり) の3段階で正確に評価・記録する仕組みを構築。
- **データカテゴリ集計とサマリー出力**:
  - `Database`, `Architecture`, `Security`, `UI`, `API` などのカテゴリ別に、違反件数（Errors, Warnings）およびステータスを可視化するサマリー集計を自動化。
- **AI向け構造化 `nextAction` および `remediation`**:
  - 違反を検出した際、AIが自己修復できるように具体的な修正アクションを配列形式（`nextAction`）および人間向けの修正方針（`remediation`）として JSON 出力に統合。

### 2. 外部 JSON Rule Engine 方式の採用
- 各ルールを Python 内に直接ハードコードせず、`tools/architecture_rules.json` (v1.1.0) に完全外出し。
- 今後のルール追加の際、Python エンジンを変更することなく JSON の設定変更のみで対応できる高い拡張性を担保。

---

# Release Notes - v4.1-audit-data-integrity

## 🚀 New Features & Enhancements

### 1. Area Metadata Foundation v1 完成
- `cityKana` / `townKana` の Single Source of Truth (SSOT) 確立。
  - 生成責務を `v2_extract.gs` に一本化し、`v2_map.gs` における二重生成・CSV再解析を完全排除しました。
  - カナ情報を `__TEMP_ADDRESSES__` (一時マスタ) ➔ `__SYSTEM_CACHE__` ➔ `areaSummary` ➔ Hアプリの順に一貫して伝播するクリーンなデータフローを構築。
- `AreaSummary` API の JSON レスポンス仕様（`version: 1`, `cityKana`, `townKana`, `repAddress` 等）を固定化。
- 将来の `AreaID` / `District` / `Prefecture` 等の拡張に備えたロードマップ設計（v1, v2, v3）を整備。

### 2. Hアプリ（配布員アプリ）検索・五十音インデックス基盤完成
- `active/mobile/render.js` および `app.js` を刷新。
- 第1層（自治体一覧）における各自治体の所属エリア数（シート数）の動的集計・表示。
- 第2層（エリア一覧）上部への「🔍 エリア検索窓」および「あ〜わ」の五十音インデックスボタンパネルの追加。
- サーバー通信を発生させずにメモリ上で即座にフィルタリングする `renderFilteredAreaList()` による爆速のUI応答性能を確保。

### 3. Audit OS v3.2（Data Integrity Audit）実装・検証完了
- `active/gas/v2_kernel.gs` (Version 3.2) におけるデータ整合性監査（Data Integrity Audit）の実装。
- 各工程（EXTRACT ➔ BATCH ➔ CACHE ➔ API）のタイミングにおいて、以下の論理的整合性をインメモリで検証し、`02_SYSTEM` フォルダへ `AUDIT_DATA_*.json` を自動保存する仕組みを統合。
  - **Sort Integrity (`auditSortIntegrity`)**: カナ順ソートの維持検証。
  - **Metadata Integrity (`auditMetadataIntegrity`)**: 必須カナ項目およびバージョン欠損の検出。
  - **Count Integrity (`auditCountIntegrity`)**: ステージ間におけるデータ件数ズレの検証。
  - **Hash Integrity (`auditHashIntegrity`)**: 改ざん検知用のステージ固有正規化ハッシュ比較検証。
  - **Schema Integrity (`auditSchemaIntegrity` - 予約実装)**: 将来のスキーマ拡張に追従する監査プレースホルダー。
- リセット（`deleteAllAreaSheets`）実行時に「チラシ保管庫」シートのデータ行も自動初期化（クリア）する安全なリセットポリシーを統合。

---

## 🐛 Bug Fixes
- **郵便番号ソート問題の解消**: `v2_batch.gs` の `forceStartBatch()` 内で SSOT 五十音ソート順を上書き破壊していた `addresses.sort()` 処理を完全に削除し、五十音順でのエリアシート生成順序を保護しました。
