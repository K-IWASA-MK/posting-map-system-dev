# Real Data Synchronization 仕様書 - Synchronization Foundation (S2-3)

## 1. 同期アーキテクチャ (Synchronization Architecture)

本仕様は、可視化ダッシュボード、配布員アプリ（H-App）、GAS API、およびスプレッドシート（SSOT）間で、実データを高信頼・低遅延・低負荷で同期するためのデータ同期層（Synchronization Layer）を定義します。

```
                    [ GAS API / Spreadsheet (SSOT) ]
                                    ▲
                                    │ (HTTP POST / retry with backoff)
                          [ DashboardApiClient ]
                                    ▲
                                    │
                       [ SynchronizationScheduler ] (Events: sync-start, sync-success, etc.)
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
  [ CacheManager ]    [ DeltaSynchronizationManager ] [ ConflictResolver ]
 (TTL Cache Storage)      (Sync Pointer Trackers)   (Merge Area/Log/Stock)
```

---

## 2. 差分同期ポリシー (Delta Synchronization Policy)

差分更新ポインタを多重定義することにより、同期漏れや重複取得を論理的に排除します。

* **タイムスタンプ・IDの2軸管理**: `DeltaSynchronizationManager` が最後に同期に成功した `lastSyncTimestamp` および `lastEventId` を永続的に追跡・管理します。
* **判定方法**:
  - `timestamp < lastSyncTimestamp`: 過去のデータとして自動破棄（`sync-skipped`）
  - `timestamp === lastSyncTimestamp` かつ `id === lastEventId`: 重複データとして自動破棄（`sync-skipped`）
  - それ以外の場合のみ、同期ポインタを更新して新規データとして取り込み処理を行います。

---

## 3. キャッシュポリシー (Cache Policy)

API通信回数および端末負荷を削減するため、メモリベースのキャッシュ機構を導入します。

* **キャッシュエンティティとデフォルト TTL 設定**:
  - `Dashboard`: 60,000ms (1分)
  - `Area`: 30,000ms (30秒)
  - `VoteTurnout`: 300,000ms (5分)
  - `Inventory`: 30,000ms (30秒)
  - `EventLog`: 15,000ms (15秒)
* **Settings 連携**: 将来的な顧客・プラン別の柔軟な調整のため、キャッシュ TTL は `window.POSTING_MAP_CONFIG.CACHE_TTL` の設定値オブジェクトより引き当てを行い、未設定時はデフォルト値を使用する構成とします。
* **キャッシュの無効化（Invalidation）**: 手動更新（Force Refresh）や、同期イベントでの競合・部分更新時は、対応するキャッシュキーを明示的にクリアして最新データを引き当てます。

---

## 4. 指数バックオフ付きリトライ (Retry Policy)

一時的なネットワークエラーやサーバー負荷に対応するリトライ機能をカプセル化します。

* **指数バックオフアルゴリズム**: エラー発生時の再試行間隔を以下の計算式で決定します。
  $$Delay = InitialDelay \times Factor^{(Attempt - 1)}$$
  *(例: 初期値 1,000ms、Factor=2 の場合: 1回目失敗後 1s、2回目失敗後 2s、3回目失敗後 4s)*
* **リトライ限界（Retry Limit）**: 最大試行回数はデフォルトで 3 回とし、超過時は `sync-failed` イベントを発火して同期ループを一時中断します。

---

## 5. オフライン回復力 (Offline Recovery)

移動中の電波瞬断（トンネルや地下など）に耐えるフォールバックフローです。

* **オフライン検知**: `navigator.onLine` が `false` になった際、即座にスケジューラは `sync-offline` イベントを発火し、API リクエスト送信処理を自発的に一時停止します。
* **自動回復**: 電波が復帰して `onLine` が `true` に切り替わった次の周期、またはネットワーク回復時に、前回の同期再開ポイント（`lastSyncTimestamp`）から自動的に差分同期を再開（`CONNECTED` 状態へ復帰）します。

---

## 6. 競合解決ポリシー (Conflict Resolution Policy)

同時打刻や同時ロードに伴うデータの巻き戻りや矛盾を防ぐためのマージ仕様です。

* **EventLog 競合解決**: EventID（一意識別子）の一致を検証し、未登録のものだけを配列に追加（最新順にソート）します。
* **Area（地区情報）競合解決**: `doneCount`（配布完了数）は、既存の値と新着の値のうち **大きい方の値** を常に採用します。これにより、部分同期データによる進捗値の巻き戻り（デグレード）を完全に防止します。
* **Inventory（チラシ在庫）競合解決**: 在庫ログに含まれる `lastUpdatedAt`（最終更新日時）を比較し、最新日時の在庫量を優先して採用します。
* **AIOS 対応と Strategy パターン拡張性**: 将来的に AI 判定や高度な意思決定エンジン（AIOS）を組み込む場合に備え、競合解決ルールは Strategy パターンで動的に差し替え可能な設計（`ConflictResolver` をインターフェース化、またはマージメソッドのストラテジ注入を許容）の考慮を盛り込んでいます。

---

## 7. スケジューライベント定義 (Scheduler Events)

UI 状態表示やインジケータ更新のため、`SynchronizationScheduler` は以下のイベントのみを外部（EventCoordinator / UI）へ発火します。

| イベント名 | 発火タイミング |
| :--- | :--- |
| `sync-start` | 同期トランザクションの開始時 |
| `sync-success` | キャッシュまたは API 経由での同期データ取得に成功した時 |
| `sync-failed` | 最大リトライ超過、または API からのエラー返却時 |
| `sync-skipped` | 差分データが存在せず、同期ポインタが変化しなかった時 |
| `sync-offline` | ブラウザのオフラインを検知し、同期をスキップした時 |
| `sync-retry` | 通信エラーによる指数バックオフ再試行の間隔待機に入った時 |
