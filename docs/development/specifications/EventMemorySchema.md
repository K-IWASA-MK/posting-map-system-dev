# Event Memory Schema Specification (EventMemorySchema.md)

## 1. メモリ・データモデル (Event Memory Schema)
メモリ構造データは以下の JSON スキーマを厳守する。

```json
{
  "memoryId": "string",
  "sourceType": "string",
  "sourceId": "string",
  "snapshot": {},
  "createdAt": "string",
  "category": "string",
  "referenceIds": ["string"]
}
```

### スキーマ詳細
* **memoryId**: メモリレコードを一意に識別するユニークな ID（例: `mem_SNAPSHOT_...`）。
* **sourceType**: スナップショットの元データ型（例: `pattern`, `evolution`）。
* **sourceId**: 元データの ID。
* **snapshot**: 発生時のオブジェクト状態の複製コピー（完全不変化）。
* **createdAt**: メモリが生成された時点のタイムスタンプ。
* **category**: カテゴリ（例: `runtime`, `governance`）。
* **referenceIds**: 関連するエボリューション ID やパターン ID の配列。

---

## 2. 不変制約 (Immutability Rules)
- ストアに保存されるスナップショットを含むすべてのメモリレコードおよび内部配列は、すべて `Object.freeze` で凍結され、追加後の値変更は一切禁止される。
- 自己改善計画、異常判定、推奨アクション、予測結果などは一切格納しない。
