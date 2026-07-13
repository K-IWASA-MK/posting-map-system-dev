# 仕様定義書 - Dashboard Operational Foundation

## 1. 概要
本ドキュメントは、POSTING MAP Dashboard の実運用を統制するための監視・可視化・運用の基本設計および仕様を定義します。
システム状態の健全性（Health）、収集メトリクス（Metrics）、通知（Notification）、表示インジケータ（Status）を独立した監視モジュール群に分離し、Dashboard 内で閉じた一方向データフローを保証します。

---

## 2. 監視のしきい値 (Operational Thresholds)
運用品質を均一化するため、健康状態評価のしきい値は以下の定数に準拠します。
* **`SYNC_WARNING_MS`**: `60000` (最終同期完了から60秒経過で警告状態)
* **`SYNC_ERROR_MS`**: `180000` (最終同期完了から180秒経過で同期不能エラー)
* **`RETRY_WARNING_COUNT`**: `2` (リトライ回数が2回以上に達した場合は警告状態)

---

## 3. 状態区分とUI表現 (Operational Status & Styling)
システムの動作状況を一元管理するため、以下の5つの基本ステートを定義します。
* **`NORMAL`**: 正常接続・同期動作完了状態。
  - UI表記: `● LIVE` (緑色: `#10b981`, 背景不透明度 10%)
* **`SYNCING`**: 現在同期処理が走っている最中の状態。
  - UI表記: `● SYNCING` (青色: `#3b82f6`, 背景不透明度 10%)
* **`WARNING`**: 同期遅延・リトライ超過などが生じているが動作している状態。
  - UI表記: `● WARNING` (琥珀色: `#f59e0b`, 背景不透明度 10%)
* **`ERROR`**: API疎通不可・同期完全停止などの異常状態。
  - UI表記: `● ERROR` (赤色: `#ef4444`, 背景不透明度 10%)
* **`OFFLINE`**: ブラウザまたはシステムがオフラインと検知した状態。
  - UI表記: `● OFFLINE` (灰色: `#6b7280`, 背景不透明度 10%)

ヘルスインジケータ部品（`HealthIndicator`）は、ダッシュボード全体と調和するよう「Apple級の余白設計」および「微発光（控えめなパルスアニメーション）」を備えたガラスモーフィズムで構築します。

---

## 4. 運用通知ポリシー (Notification Center Policy)
ダッシュボード左下または右下に一時的に表示されるインメモリ通知ポップアップを定義します。
* **最大保持件数 (`MAX_NOTIFICATION_HISTORY`)**: `50`
  - メモリリーク防止のため、履歴が50件を超えた場合は古いものから自動削除（シフトアウト）します。
* **対象イベント**:
  - `Sync Success`, `Sync Failed`, `Retry Started`, `Offline`, `Recovery`, `Cache Cleared`, `Warning`
* 外部ネットワーク（LINE, メール, Push通知）への送信は一切行わず、表示用DOM生成のみを行います。

---

## 5. 強制更新フロー (Force Refresh Flow)
ヘッダーに配置する「強制更新（Force Refresh）」ボタン押下時のデータフローは、責務分離を徹底するため以下のイベント駆動設計で行います。

```
[DashboardHeader] (Force Refresh クリック)
       │
       ▼ (発火)
[EventCoordinator] (Event: 'refresh-requested')
       │
       ▼ (購読)
[DashboardApplication]
       │
       ▼ (命令)
[DashboardRefreshController]
       │
       ├─ (命令: キャッシュクリア) ──> [CacheManager.clear()]
       ├─ (命令: ポインタクリア) ───> [DeltaSynchronizationManager.resetPointer()]
       └─ (命令: 同期即時実行) ───> [SynchronizationScheduler.triggerImmediateSync()]
```
これにより、UI層がデータ構造や同期エンジンの詳細に直接触れることなく安全にキャッシュ全無効化＋即時取得を実行します。
