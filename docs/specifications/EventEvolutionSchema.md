# Event Evolution Schema Specification (EventEvolutionSchema.md)

## 1. エボリューション・データモデル (Event Evolution Schema)
エボリューション構造データは以下の JSON スキーマを厳守する。

```json
{
  "evolutionId": "string",
  "sourceType": "string",
  "sourceId": "string",
  "previousState": {},
  "currentState": {},
  "changeType": "string",
  "timestamp": "string"
}
```

### スキーマ詳細
* **evolutionId**: エボリューションオブジェクトを一意に識別するユニークな ID（例: `evo_KNOWLEDGE_...`）。
* **sourceType**: 変化を検出した対象のレイヤー型（例: `knowledge`, `insight`）。
* **sourceId**: 変化対象のオブジェクトの ID。
* **previousState**: 変化前の状態オブジェクト（未存在時は空オブジェクトまたは `null`）。
* **currentState**: 変化後の状態オブジェクト。
* **changeType**: 変化タイプ（`ADD`, `MODIFY`, `REMOVE` 等）。
* **timestamp**: 変化が検出・生成された時点のタイムスタンプ。

---

## 2. 不変制約 (Immutability Rules)
- ストアに保存されるエボリューションオブジェクトおよび内部配列・マップは、すべて `Object.freeze` で凍結され、生成後の変更は一切禁止される。
- AIによる予測や自動的な改善判定結果は一切格納しない。
