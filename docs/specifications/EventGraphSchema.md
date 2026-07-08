# Event Graph Schema Specification (EventGraphSchema.md)

## 1. グラフデータモデル (Event Graph Schema)
グラフ構造データは以下の JSON スキーマを厳守する。

```json
{
  "graphId": "string",
  "nodes": [
    {
      "eventId": "string",
      "timestamp": "string",
      "category": "string",
      "severity": "string"
    }
  ],
  "edges": [
    {
      "source": "string",
      "target": "string",
      "relationType": "string"
    }
  ]
}
```

### スキーマ詳細
* **graphId**: グラフインスタンスを一意に識別するユニークな ID（例: `graph_TEMPORAL_SEQUENCE_...`）。
* **nodes**: グラフ内に存在するイベントノードの配列。
* **edges**: ノード間の関係を表現する接続エッジの配列。
  * `source`: 接続元の `eventId`。
  * `target`: 接続先の `eventId`。
  * `relationType`: 相関タイプ（`TEMPORAL_SEQUENCE`, `CATEGORY_GROUP`, `SOURCE_GROUP`）。

---

## 2. 厳格な不変性 (Immutability Rules)
- ストアに保存されるグラフオブジェクト、および内部の `nodes` 配列、`edges` 配列は、すべて `Object.freeze` で凍結され、生成後の変更は一切禁止される。
