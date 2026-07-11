# POSTING MAP プロダクト開発範囲定義書 (PROJECT_SCOPE)

## 1. スプリント1 完了定義 (Sprint 1 Scope)
スプリント1では、ポスティング活動管理システム（POSTING MAP）の可視化ダッシュボードおよびAPI通信の強固な基盤を構築し、「製品としての体裁を備えたMVP」を完成させます。

### 完了条件と機能一覧
* **ダッシュボード起動フローの確立**:
  - 設定値に基づいて `DashboardApplication` が立ち上がり、DOMマウントから初期データ取得までがノンブロッキングで行われること。
* **GAS APIとの接続および実データマッピング**:
  - スプレッドシートの実データを取得し、スネークケースからキャメルケースへの構造化モデル（`AreaDetail`, `VoteTurnout`）へのマッピングを行うこと。
* **地図領域の可視化と Multi Map Engine 化**:
  - 地図部分への直接依存を排除した `MapEngine` 抽象化インターフェースを導入し、スプリント1用 `DOMMapEngine` が正常にエリアピンと進捗度合いを色で可視化すること。
* **過去3回国政選挙の投票率表示**:
  - エリア選択をトリガーに、対象エリアの直近3回の選挙投票率履歴（衆院選・参院選、全国平均比付きプログレスバー）が `VoteTurnoutVisualizer` で滑らかにアニメーション描画されること。
* **活動証跡イベントログ（EventLog）表示**:
  - 最新のポスティング実績ログがタイムスタンプ、配布数、担当メンバーID付きで詳細パネル内にリスト表示されること。
* **製品UI仕様 (Glass Morphism / Click = Animation)**:
  - 漆黒背景、ガラス透過ブラー（`blur(20px)`）、微発光ボーダー、ボタンやカードのクリック時のバウンス縮小スケールアニメーション（`scale(0.96)`）を適用し、製品としての高級感を確保すること。

---

## 2. スプリント2 ロードマップ (Sprint 2 Roadmap)
実業務運用に向けた実働OSへの昇華を目指す「Sprint 2: Real Operation Foundation」です。

### 完了した開発項目
* **Phase S2-1: Google Maps Engine Foundation** ✅
  - `MapEngine` 抽象化インターフェースを実装した `GoogleMapsEngine` を構築。
  - APIキーを `window.POSTING_MAP_CONFIG` から動的に引き当てる設定プロバイダー `GoogleMapsConfiguration` を実装。
  - 地図スクリプトの多重ロードを防ぐ Promise 制御 of `GoogleMapsScriptLoader` を導入。
  - カメラ制御用の `GoogleMapsCameraController` および独立した4レイヤー（Area, VoteTurnout, Activity, Marker）を管理する `GoogleMapsLayerManager` に処理を委譲。
  - 地図パネル `MapPanel` との結合を行い、設定に基づき `DOMMapEngine` と自動切り替え可能な後方互換性を担保。
* **Phase S2-2: H-App Real Connection Foundation** ✅
  - `HAppConnectionState` による 4 つ of 同期接続ステータス（CONNECTED, SYNCING, OFFLINE, ERROR）を定義・一元管理。
  - `HAppSynchronizationController` にて `lastSyncTimestamp` と `lastEventId` を用いた高信頼性差分ポーリング、およびブラウザオフライン検知（Offline Policy）を制御。
  - `HAppEventSubscriber` と `EventLogDispatcher`（イベントバス）を介して、新着ログの UI への高速配信と map/detail パネルの部分更新を描画。
  - `DashboardStateModel.addIncomingEventLog` による重複イベント破棄（EventID一意性保証）および、地区進捗（doneCount / progressRate）と全体 Stats の不変（Immutable）再計算更新処理を実装。
* **Phase S2-3: Real Data Synchronization Foundation** ✅
  - `DeltaSynchronizationManager` にて、同期時刻（lastSyncTimestamp）とイベントID（lastEventId）の2軸管理による高信頼な重複排除と差分抽出判定フローを確立。
  - `CacheManager` によるメモリキャッシュ TTL (Time-To-Live) および、設定オブジェクト（window.POSTING_MAP_CONFIG.CACHE_TTL）を考慮した動的引き当て・キャッシュ無効化（Invalidation）制御を実装。
  - `RetryController` を用いた指数バックオフ（Exponential Backoff）および最大試行制限（Retry Limit）による通信エラー回復処理を導入。
  - `ConflictResolver` による競合解決（EventLogの重複排除、AreaのdoneCountデグレード防止、Inventoryのタイムスタンプ優先）を Strategy パターンで拡張可能に設計。
  - `SynchronizationScheduler` を実装し、6つの同期ステータスイベント（sync-start, sync-success, sync-failed, sync-skipped, sync-offline, sync-retry）の発行および、ネットワーク切断時の自発的一時停止ポリシーを統制。

* **Phase S2-4: Dashboard Operational Foundation** ✅
  - システム健全性を評価する `SystemHealthMonitor` とステートマシン遷移の `OperationalStatusManager` を新設。
  - キャッシュ/同期/競合状態のメトリクスを収集・集約する `MetricsAggregator` を構築。
  - トースト表示およびインメモリ履歴制限（最大50件）を行う `NotificationCenter` および、ヘッダー用 `HealthIndicator` UIを実装。
  - ヘッダー内の「FORCE REFRESH」からイベント駆動（`refresh-requested`）によるキャッシュ全クリア＆強制再同期をDI統合。
* **Phase S2-5: Field Operation Foundation** ✅
  - 現場の活動状況（NOT_STARTED, IN_PROGRESS, COMPLETED, PAUSED）を自動・手動で管理する `DistributionStatusManager` を新設。
  - 手持ちチラシ（Flyer Holding）残数と警告しきい値監視による Dashboard-local アラートを検知する `InventoryMonitor` を構築。
  - 配布員（担当割り当てを持たない）のGPS座標と最終測位からのアクティブ判定を行う `GPSEvidenceMonitor` を実装。
  - アップロードされた証跡写真を地区単位で時系列管理する `PhotoEvidenceMonitor` を実装。
  - 現場活動完了数、アクティブ人数、GPS・写真カバレッジ等のメトリクスを集約する `FieldOperationMetrics` および現場統制コントローラー `FieldOperationController` を DI 統合。
  - `AreaDetailPanel` へ活動状況バッジ、手持ちチラシ残数、最新GPS、写真証跡リンク表示を組み込み。

* **Phase S2-6: Product Release Candidate** ✅
  - `ProductConfiguration` および `FeatureToggle` による製品・機能フラグ統括制御クラスを実装。
  - 起動前環境検証（API、DOM、Browser Compatibility、Edition Matrix、Feature Dependency）を行う `ProductRuntimeValidator` を構築。
  - バリデーション失敗時のプレミアム警告エラーオーバーレイ描画およびブートブロック処理を `DashboardBootstrap` / `DashboardApplication` へ統合。

### 主な今後の開発項目 (Sprint 3: Enterprise & AIOS Expansion)
* **Phase S3-1: GAS API Production Foundation** ✅
  - `PropertiesService` から設定値（Cache TTL, Lock Timeout等）を取得する統一設定管理 `GasConfigurationProvider` を新設。
  - スプレッドシート物理I/O（`SpreadsheetBatchReader`、`SpreadsheetBatchWriter`）を `SpreadsheetRepository` から完全分離し、キャッシュ・ロック連動型データアクセス層を実装。
  - `ApiExecutionContext` および `GasPerformanceMonitor` によるAPI監査メタデータの算出。
  - `Code.gs` (doGet/doPost) への実行コンテキスト・トランザクションパイプライン統合。

1. **Phase S3-2: Premium Feature Expansion & Edition Licensing**:
   - Stripe 決済情報とのバインド、支部別独占ライセンス（`TOKYO-01` 等）の自動停止・有効化のライセンス管理。
   - Mapbox エンジンのランタイム動的切り替えの Premium 実装。
2. **Phase S3-3: AIOS Integration & Automated Analytics**:
   - AIOS (AI組織) との安全なデータ通信ブリッジ（AIOS Bridge）の本格実装。
   - 支部比較や配布効率測定等を行う Analytics Engine の統合。

