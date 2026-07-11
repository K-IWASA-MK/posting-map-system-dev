# Field Operation Foundation Specification (現場運用基盤仕様書)

## 1. 現場運用アーキテクチャ (Field Operation Architecture)
本仕様書は、現場配布員によるポスティング活動実績（配布状況、チラシ残数、GPS位置、写真データ）を安全かつ一元的に Dashboard で収集・可視化するための現場運用基盤（Field Operation Foundation）の仕様を規定します。

本アーキテクチャはデータの一方向フロー（Unidirectional Data Flow）を堅持し、指示や経路誘導は行わず「状態と証跡の可視化・監視」に専念します。

```
[配布員 (H-App)]
      │
      ├─► 配布実績打刻 ──► (EventLog) ──┐
      ├─► GPS位置更新 ───► (GPS Log)  ──┼─► [GAS API] ─► [Spreadsheet]
      └─► 写真撮影 ──────► (Photo Log) ─┘        │
                                                ▼
                                        [Dashboard API Client]
                                                │
                                                ▼
                                   [FieldOperationController]
                                                │
       ┌──────────────────┬─────────────────────┼─────────────────────┐
       ▼                  ▼                     ▼                     ▼
[DistributionStatus] [InventoryMonitor] [GPSEvidenceMonitor] [PhotoEvidenceMonitor]
       │                  │                     │                     │
       └──────────────────┴───────────┬─────────┴─────────────────────┘
                                      ▼
                        [FieldOperationMetrics]
                                      │
                                      ▼
                         [AreaDetailPanel UI] (可視化)
```

---

## 2. 配布ステータス管理ポリシー (Distribution Status Policy)
各ポスティング対象地区（Area）の配布状態を以下の4つに定義し、リアルタイムに管理します。

* **`NOT_STARTED` (未着手)**:
  - 該当地区における累積配布完了数（`doneCount`）が `0` 枚である初期状態。
* **`IN_PROGRESS` (配布中)**:
  - 配布が開始され、かつ目標世帯数（`totalHouseholds`）に達していない状態。
  - 条件: `0 < doneCount < totalHouseholds`
* **`COMPLETED` (配布完了)**:
  - 配布完了数が目標世帯数に達した状態。
  - 条件: `doneCount >= totalHouseholds`
* **`PAUSED` (一時中断)**:
  - 実業務上で一時中断が要求された状態。進捗にかかわらず手動状態更新により強制遷移可能。

---

## 3. GPS証跡監視ポリシー (GPS Evidence Policy)
配布員の位置情報および軌跡証跡を以下の基準で監視し、なりすましや不配などの不正抑止および安全確認に役立てます。

* **GPSログの収集項目**:
  - `memberId`: 配布員ID
  - `latitude`, `longitude`: 座標（WGS84）
  - `timestamp`: 取得日時
  - `accuracy`: 測位精度（メートル）
* **Dashboardでの表示ルール**:
  - 各配布員の最新位置および「最終更新時刻」を可視化。
  - 最終更新から5分以上通信がない場合は「通信途絶 / OFFLINE」状態として可視化（GPSステータス表示のグレーアウト等）。
  - GPSの座標をベースとした地図上の軌跡描画をサポート（将来拡張用のスロット確保）。

---

## 4. 写真証跡監視ポリシー (Photo Evidence Policy)
ポスト投函やチラシ山積み放置等のエビデンス（証跡）として写真データを収集します。

* **写真ログの収集項目**:
  - `photoId`: 写真一意ID
  - `memberId`: 配布員ID
  - `areaId`: 対象地区ID
  - `photoUrl`: ストレージ保存先のURL
  - `timestamp`: 撮影・送信日時
* **表示制限**:
  - 写真画像データのAI解析（投函判定等）は一切行いません。
  - Dashboard の地区詳細パネル（`AreaDetailPanel`）にて、該当地区で撮影された最新の写真サムネイル、撮影時刻、および全サイズ画像へのリンクを表示します。

---

## 5. 在庫監視フロー (Inventory Operation Flow)
配布用チラシの持参部数残量と補充状況をリアルタイム監視し、チラシ切れによる活動停止を防ぎます。

* **監視項目**:
  - `remaining`: チラシ残数
  - `threshold`: 在庫警告閾値（デフォルト: `100` 枚）
* **アラート検知**:
  - `remaining < threshold` に達した場合、Dashboard 内部の `NotificationCenter` を介して「低在庫（Low Stock）」アラートを画面上にトースト通知。
  - 外部への Push 通知やメール送信は本フェーズの範囲外（Out of Scope）。

---

## 6. 手動リカバリポリシー (Manual Recovery Policy)
通信不安定環境やGAS障害発生時におけるデータ不整合および消失を防ぐため、以下のリカバリポリシーを規定します。

* **H-App キャッシュ・再送キュー**:
  - H-App 側で送信失敗したログはローカルキャッシュ（Web Storage等）にキューイングされ、オンライン復帰時にタイムスタンプ不変のまま再送されます。
* **Dashboard リフレッシュ・リカバリ**:
  - データの深刻な不整合やキャッシュ遅延が疑われる場合、Dashboard 上の「Force Refresh」を実行することで、クライアントの全メモリキャッシュを破棄し、Spreadsheet API から実データ（SSOT）を再同期します。

---

## 7. 現場運用監査ポリシー (Field Audit Policy)
管理者による運用の健全性チェックのため、以下の監査指標を定義します。

* **GPSカバレッジ**:
  - 配布ログが存在する時間帯に、GPS座標の受信ログが正しく存在しているかの整合比率（不整合の監査ログ）。
* **写真提出率**:
  - 配布完了地区における写真提出率の算出。
