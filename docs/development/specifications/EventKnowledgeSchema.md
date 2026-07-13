# Event Knowledge Schema Specification (EventKnowledgeSchema.md)

## 1. ナレッジ・データモデル (Event Knowledge Schema)
ナレッジ構造データは以下の JSON スキーマを厳守する。

```json
{
  "knowledgeId": "string",
  "eventIds": ["string"],
  "category": "string",
  "source": "string",
  "timestampRange": {
    "start": "string",
    "end": "string"
  },
  "summary": "string",
  "metadata": {}
}
```

### スキーマ詳細
* **knowledgeId**: ナレッジオブジェクトを一意に識別するユニークな ID（例: `know_TEMPORAL_SEQUENCE_...`）。
* **eventIds**: 関連するイベント（eventId）の配列。
* **category**: 主たるカテゴリ（例: `runtime`, `governance`）。
* **source**: 情報元（例: `Kernel`, `QualityGate`）。
* **timestampRange**: 開始・終了時間のタイムスタンプ範囲。
* **summary**: 自動構成される客観的サマリー（例: "RUNTIME category event sequence containing 3 events."）。AIによる要約や成功失敗の推測記述は行わない。
* **metadata**: 付随データ用空マップ（将来拡張用）。

---

## 2. 不変制約 (Immutability Rules)
- ストアに保存されるナレッジオブジェクトおよび内部配列・マップは、すべて `Object.freeze` で凍結され、生成後の変更は一切禁止される。
- AIによる予測（No Prediction）や自動的な異常検出結果は一切格納しない。
