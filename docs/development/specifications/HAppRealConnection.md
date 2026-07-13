# H-App Real Connection 仕様書 - Real Connection Foundation (S2-2)

## 1. アーキテクチャ概要 (Communication Architecture)

本コンポーネントは、現場で活動する配布員アプリ（H-App）から送信されスプレッドシート（SSOT）へ書き込まれた活動証跡イベントログ（EventLog）を、Dashboard 側へリアルタイム（または高頻度）かつ安全に同期・可視化するための同期基盤です。

### データの同期・配信フロー (EventLog Flow)
```
[H-App (LINE LIFF)]
      │
      ▼ (Event log push via GAS API)
[Spreadsheet (SSOT)]
      │
      ▼ (HTTP POST / getEventLog)
[DashboardApiClient]
      │
      ▼ (Differential retrieve)
[HAppSynchronizationController] ──(Updates)──► [HAppConnectionState]
      │
      ▼ (Normalization & Mapping)
[HAppEventSubscriber]
      │
      ▼ (Uniqueness Check & State Update)
[DashboardStateModel (addIncomingEventLog)]
      │
      ▼ (Broadcast log item)
[EventLogDispatcher]
      │
      ├───────────────────────┬────────────────────────┐
      ▼                       ▼                        ▼
  [MapPanel]         [AreaDetailPanel]         [DashboardLayout]
(Render pin markers) (Show list & history)    (Stats cards update)
```

---

## 2. 差分同期ポリシー (Synchronization Flow)

多重・欠落のない強固な同期制御を行うため、同期コントローラー（`HAppSynchronizationController`）は以下の項目を管理します。

* **`lastSyncTimestamp` (最終同期時刻)**: 同期 API リクエスト時に `sinceTimestamp` パラメータとして送信し、前回取得より新しいログのみを差分取得します。
* **`lastEventId` (最終イベントID)**: タイムスタンプが同一のログが複数存在する場合に重複取得を防ぐため、最終取得ログのIDを記録し、比較評価に用います。
* **将来の拡張性**: 現在はポーリング（ショートポーリング）形式で実装しますが、インターフェース設計上、ポーリングループ部分を Server-Sent Events (SSE) または WebSocket クライアントへ将来的に改修不要で置換できる抽象設計（`startSyncLoop()`, `stopSyncLoop()`）とします。

---

## 3. イベントの一意性・重複防止ルール (EventID Uniqueness)

API 通信の再試行やポーリングタイミングのズレによるデータの多重書き込み・二重カウントを確実に抑止します。

* **EventID 重複排除ルール**: `DashboardStateModel.addIncomingEventLog()` にて、新着ログの `id`（EventID）が既存の `eventLogs` 配列内に存在するかどうかを検証します。
* **重複時の処理**: 同一の EventID が既に登録されている場合は、そのイベントの処理を破棄（スキップ）し、状態更新および通知を発火させません。

---

## 4. 状態モデルの不変更新 (Dashboard Update Flow)

新着イベントログの追加に伴い、ダッシュボード内の関連データをすべて **不変（Immutable）** に再計算して更新します。

1. **イベントログの追加**: 最新順に並べるため、不変な新規配列を作成して先頭に追加し `eventLogs` を更新します。
2. **地区進捗（AreaDetail）の再計算**:
   - 受信したログの `areaId` に該当する地区を特定します。
   - `doneCount`（配布完了数）にログの `count`（配布数）を加算します。
   - `totalHouseholds` に基づき `progressRate`（進捗率: 最大100%）を算出し直します。
   - 変更された地区オブジェクトを新規生成し、不変な新規 `areas` 配列を構築します。
3. **全体統計（Stats）の再計算**:
   - `stats.totalCompleted` にログの `count` を加算します。
   - `stats.totalHouseholds` と比較して全体の `progressRate` を算出し直します。
4. **変更通知**: 状態モデルの `notify()` を呼び出し、ダッシュボード全体（および `EventLogDispatcher`）に変更を即時波記させます。

---

## 5. 接続状態管理 (HAppConnectionState)

ネットワーク状態や同期状態をフロントエンド全体で可視化するため、4つの接続状態を管理します。

| 状態名 | 定義 | UI表現 |
| :--- | :--- | :--- |
| `CONNECTED` | 同期ループが稼働中で、前回の同期が成功している状態 | 緑発光インジケータ |
| `SYNCING` | 現在、GAS API に対する差分同期リクエストを実行中の状態 | アニメーションインジケータ |
| `OFFLINE` | ブラウザのオフライン検知、または同期の自発的停止状態 | 灰色インジケータ |
| `ERROR` | API通信エラー、タイムアウト、認証エラーなどの異常状態 | 赤発光インジケータ |

---

## 6. エラー回復・オフラインポリシー (Error & Offline Policy)

屋外の不安定な通信環境に対応するためのフォールバック処理を規定します。

* **エラー回復**: API 通信が一時的に失敗し `ERROR` 状態に遷移した場合でも、次周期の同期処理は実行され、接続が回復した時点で自動的に `CONNECTED` 状態へ復帰します。
* **オフライン検知**: ブラウザの `navigator.onLine` が `false` になった場合、または API 接続エラーが連続して発生した場合は、即時に `OFFLINE` 状態に遷移し、不要な API リクエストの送信を自発的に一時停止します。
