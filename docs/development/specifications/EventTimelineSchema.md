# Event Timeline Schema Specification (EventTimelineSchema.md)

## 1. タイムライン・データモデル (Timeline Data Model)
タイムラインストアに蓄積される各イベントオブジェクトは、以下のスキーマ構造に完全準拠しなければならない。

```json
{
  "eventId": "string",
  "timestamp": "string",
  "category": "string",
  "severity": "string",
  "message": "string",
  "source": "string"
}
```

### スキーマプロパティ詳細
* **eventId**: イベントを一意に識別するユニークな識別子（重複排除のキーとなる）。
* **timestamp**: イベントの発生時刻（ソートおよび時間軸表示の基準）。
* **category**: `runtime` / `governance` / `quality` / `simulation` / `trust` などの論理区分。
* **severity**: `CRITICAL` / `WARNING` / `INFO` の 3 段階の重要度レベル。
* **message**: 画面に表示される具体的なイベント内容（静的メッセージ）。
* **source**: イベントの発行元（例: "Kernel", "QualityGate", "GovernanceManager"）。

---

## 2. 不変性・アペンドオンリーの制約 (Immutability & Append-only Constraints)
- **Immutable (不変)**:
  ストアにアタッチされたイベントオブジェクトは、格納後、いかなるプロパティの書き換え、追加、または削除も行わないよう `Object.freeze` 等で確実に凍結（不変保護）される。
- **Append-only (追加専用)**:
  ストアに対する操作は「新しいイベントの追加（add）」および「全クリア（clear）」のみであり、既存イベントに対する個別削除（delete）や更新（update）API は提供しない。
- **No Mutation (状態書込みなし)**:
  イベントオブジェクトのプロパティを加工・変形してストアに書き戻す処理は禁止する。
