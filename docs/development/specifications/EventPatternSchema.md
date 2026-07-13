# Event Pattern Schema Specification (EventPatternSchema.md)

## 1. パターン・データモデル (Event Pattern Schema)
パターン構造データは以下の JSON スキーマを厳守する。

```json
{
  "patternId": "string",
  "signature": "string",
  "occurrenceCount": 0,
  "associatedEvolutionIds": ["string"],
  "category": "string",
  "lastObserved": "string"
}
```

### スキーマ詳細
* **patternId**: パターンオブジェクトを一意に識別するユニークな ID（例: `pat_SIGNATURE_...`）。
* **signature**: パターン化の基準となる客観的な構造シグネチャ文字列（例: `SIG_INSIGHT_TREND_RUNTIME`）。
* **occurrenceCount**: 同一シグネチャを持つ発生数。
* **associatedEvolutionIds**: 関連するエボリューション ID の配列。
* **category**: パターンの主カテゴリ（例: `runtime`, `governance`）。
* **lastObserved**: 最後に本パターンが検出された時点のタイムスタンプ。

---

## 2. 不変制約 (Immutability Rules)
- ストアに保存されるパターンオブジェクトおよび内部配列・マップは、すべて `Object.freeze` で凍結され、生成後の変更は一切禁止される。
- AI予測（No Prediction）、自律的解決のための推奨アクション、およびモデルの動的学習ロジックは一切格納しない。
