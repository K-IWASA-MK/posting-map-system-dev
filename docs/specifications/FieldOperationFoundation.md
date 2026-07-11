# Field Operation Foundation Specification (現場運用基盤仕様書)

## 0. 設計原則 (Design Principle)
> [!IMPORTANT]
> **POSTING MAP 設計原則**
> POSTING MAPは活動管理システムではなく、「活動記録・可視化システム」である。
> システムは配布員に対して、以下の項目を管理・決定しない：
> - 担当地区 (Assigned Area)
> - 配布順 (Delivery Order)
> - 配布ルート (Delivery Route)
> - ノルマ (Delivery Quotas)
> - 優先順位 (Priority)
> 
> POSTING MAPが管理・記録する対象は以下の項目のみとする：
> - 活動実績 (EventLog)
> - GPS位置証跡 (GPS Evidence)
> - 写真証跡 (Photo Evidence)
> - 預かりチラシ (Held Flyers / Flyer Holding)
> - 活動日時・履歴 (Activity History)

---

## 1. 機能トグル (Feature Flags)
本現場運用基盤は、以下の Feature Flag によって各機能の有効化・無効化（ON/OFF）が動的に制御可能となるように設計されています。

* **`Flyer Holding` (デフォルト: false)**:
  - 預かりチラシ（手持ちチラシ残数、低在庫警告など）の管理機能。POSTING MAPではデフォルト無効とし、他業種向けや特別オプション時にのみ有効化されます。
* **`Google Maps` (デフォルト: true)**:
  - Google Maps Engine の有効化。
* **`Mapbox` (デフォルト: false)**:
  - 将来の Mapbox Engine 有効化。
* **`GPS Evidence` (デフォルト: true)**:
  - 配布員の位置情報、アクティブ状況の可視化。
* **`Photo Evidence` (デフォルト: true)**:
  - 提出されたエビデンス写真の時系列表示。
* **`AIOS Bridge` (デフォルト: false)**:
  - AIOS との自動情報連携ブリッジ機能。

---

## 2. 現場活動可視化アーキテクチャ (Field Operation Architecture)
本仕様書は、現場配布員によるポスティング活動実績（活動状況、手持チラシ数、GPS位置、写真データ）を安全かつ一元的に Dashboard で収集・可視化するための現場運用基盤（Field Operation Foundation）の仕様を規定します。

本アーキテクチャはデータの一方向フロー（Unidirectional Data Flow）を堅持し、指示や経路誘導は行わず「状態と証跡の可視化・監視」に専念します。

```
[配布員 (H-App)]
      │
      ├─► 活動実績打刻 ──► (EventLog) ──┐
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
[ActivityStatus]   [FlyerHoldingMonitor]  [GPSEvidenceMonitor] [PhotoEvidenceMonitor]
       │                  │                     │                     │
       └──────────────────┴───────────┬─────────┴─────────────────────┘
                                      ▼
                        [FieldOperationMetrics]
                                      │
                                      ▼
                         [AreaDetailPanel UI] (可視化)
```

---

## 3. 活動状況管理ポリシー (Field Activity Status Policy)
各ポスティング対象地区における配布活動状況（Field Activity Status）を以下の4つに定義し、リアルタイムに可視化します。地区の担当状態や配布担当の割り当て管理機能は持ちません。

* **`NOT_STARTED` (活動未着手)**:
  - 該当地区における累積配布完了数（`doneCount`）が `0` 枚である初期状態。
* **`IN_PROGRESS` (活動中)**:
  - 配布活動が開始され、かつ目標世帯数（`totalHouseholds`）に達していない状態。
  - 条件: `0 < doneCount < totalHouseholds`
* **`COMPLETED` (活動完了)**:
  - 配布完了数が目標世帯数に達した状態。
  - 条件: `doneCount >= totalHouseholds`
* **`PAUSED` (一時中断)**:
  - 実業務上で一時中断が要求された状態。進捗にかかわらず手動状態更新により強制遷移可能。

---

## 4. GPS証跡監視ポリシー (GPS Evidence Policy)
配布員の位置情報および軌跡証跡を以下の基準で可視化し、安全確認に役立てます。

* **GPSログ of 収集項目**:
  - `memberId`: 配布員ID
  - `latitude`, `longitude`: 座標（WGS84）
  - `timestamp`: 取得日時
  - `accuracy`: 測位精度（メートル）
* **Dashboardでの表示ルール**:
  - 各配布員の最新位置および「最終更新時刻」を可視化。
  - 最終更新から5分以上通信がない場合は「通信途絶 / OFFLINE」状態として可視化（GPSステータス表示のグレーアウト等）。
  - GPSの座標をベースとした地図上の軌跡描画をサポート（将来拡張用のスロット確保）。

---

## 5. 写真証跡監視ポリシー (Photo Evidence Policy)
投函エビデンス（証跡）として写真データを収集します。

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

## 6. 手持ちチラシ監視フロー (Flyer Holding Monitor Flow)
配布用チラシの持参部数残量（Remaining Held Flyers）をリアルタイムに集計可視化し、補充タイミングの把握を支援します。

* **監視項目**:
  - `remaining`: 手持ちチラシ残数 (Remaining Held Flyers)
  - `threshold`: 警告しきい値（デフォルト: `100` 枚）
* **アラート検知**:
  - `remaining < threshold` に達した場合、Dashboard 内部の `NotificationCenter` を介して「手持ち僅少」アラートを画面上にトースト通知。
  - 外部への Push 通知やメール送信は本フェーズの範囲外（Out of Scope）。

---

## 7. 手動リカバリポリシー (Manual Recovery Policy)
通信不安定環境やGAS障害発生時におけるデータ不整合および消失を防ぐため、以下のリカバリポリシーを規定します。

* **H-App キャッシュ・再送キュー**:
  - H-App 側で送信失敗したログはローカルキャッシュ（Web Storage等）にキューイングされ、オンライン復帰時にタイムスタンプ不変のまま再送されます。
* **Dashboard リフレッシュ・リカバリ**:
  - データの深刻な不整合やキャッシュ遅延が疑われる場合、Dashboard 上の「Force Refresh」を実行することで、クライアントの全メモリキャッシュを破棄し、Spreadsheet API から実データ（SSOT）を再同期します。

---

## 8. 現場運用監査ポリシー (Field Audit Policy)
管理者による運用の健全性チェックのため、以下の監査指標を定義します。

* **GPSカバレッジ**:
  - 活動ログが存在する時間帯に、GPS座標の受信ログが正しく存在しているかの整合比率。
* **写真提出率**:
  - 活動完了地区における写真提出率の算出。
