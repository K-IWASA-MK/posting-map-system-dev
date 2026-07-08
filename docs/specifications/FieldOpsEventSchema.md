# Field Operations Event Schema Specification

POSTING MAP の現場活動データを AIOS Intelligence Pipeline へ接続するためのイベントスキーマ定義書。
本仕様は、現場活動の客観的な「状況観測イベント」を扱うものとし、配布完了やユーザーのステータス実更新などの操作・書込みロジックは一切含まない。

---

## 1. Field Operations Event Schema

イベントバスへ供給される全ての現場活動イベントオブジェクトは、生成時に `Object.freeze()` の適用を必須とする。

```typescript
interface FieldOpsEvent {
  eventId: string;          // イベント一意識別子 (e.g., "evt-field-101")
  tenantId: string;         // テナント隔離ID (e.g., "MIE-03")
  sourceType: "FIELDOPS";   // 現場データソース識別（固定値）
  category: "field_operation"; // 分類名
  areaId: string;           // 配布エリアコード (e.g., "MIE-03-AREA-201")
  action: "ACTIVITY_LOG" | "DISTRIBUTION_ACTIVITY" | "AREA_MOVEMENT" | "STOCK_UPDATE"; // 活動観測アクション
  timestamp: string;        // 画面表示用タイムスタンプ (e.g., "12:34:56")
  rawTimestamp: number;     // 順序ソート用エポックミリ秒
  payload: {
    staffId: string;        // 配布員を匿名化したID
    volume: number;         // チラシなどの配布・在庫ボリューム (action が STOCK_UPDATE または DISTRIBUTION_ACTIVITY の際に関連)
    latitude?: number;      // 緯度 (areaId が曖昧な場合や移動ログで利用可能)
    longitude?: number;     // 経度
    details?: string;       // テキスト詳細
  }
}
```

---

## 2. eventAction (アクション区分) の定義
POSTING MAP の活動観測モデルに適合させるため、単一の配布完了（POSTING_COMPLETE）概念を排し、活動状況および配布物の保管状況等を捉える汎用的な活動アクションを定義する。

* **`DISTRIBUTION_ACTIVITY` (配布活動)**:
  配布員がチラシ等の配布（投函）活動を行った際の観測。
* **`AREA_MOVEMENT` (エリア移動)**:
  配布員が指定エリア内へ進入・退出、またはエリア間を移動した際の観測。
* **`STOCK_UPDATE` (在庫移動・保管状況)**:
  支部や拠点、配布員間でのチラシの引き渡しや、保管在庫数が変動した際の観測。
* **`ACTIVITY_LOG` (活動日誌・テキスト報告)**:
  現場で配布員が「配布困難」や「配布完了」などの任意の状態を活動メモとして起票した際の観測。

---

## 3. 連携原則 (Bridge Integration Rules)
* **接続確認の保証**:
  本フェーズでは、外部APIゲートウェイや実認証トークンは扱わず、Simulation Providerによる模擬的な現場イベントの発生に特化する。将来の本番API接続時には、`FieldOpsEventProvider` のデータ注入部のみを交換するインターフェース設計を順守すること。
