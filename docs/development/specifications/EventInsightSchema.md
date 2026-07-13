# Event Insight Schema Specification (EventInsightSchema.md)

## 1. インサイト・データモデル (Event Insight Schema)
インサイト構造データは以下の JSON スキーマを厳守する。

```json
{
  "insightId": "string",
  "knowledgeIds": ["string"],
  "category": "string",
  "trendData": {
    "count": 0,
    "ratio": 0.0,
    "timeRange": {
      "start": "string",
      "end": "string"
    }
  },
  "summary": "string",
  "metadata": {}
}
```

### スキーマ詳細
* **insightId**: インサイトオブジェクトを一意に識別するユニークな ID（例: `ins_TREND_...`）。
* **knowledgeIds**: 関連するナレッジ ID（knowledgeId）の配列。
* **category**: インサイトの主カテゴリ（例: `runtime`, `governance`）。
* **trendData**: 客観的統計情報（イベント件数、全体に対する発生比率、タイムスタンプ範囲）。
* **summary**: 自動構成される客観的な傾向サマリー（例: "Observed runtime trend consisting of 3 knowledge chains."）。AIによる原因分析や障害判定などの推論記述は行わない。
* **metadata**: 付随データ用空マップ（将来拡張用）。

---

## 2. 不変制約 (Immutability Rules)
- ストアに保存されるインサイトオブジェクトおよび内部配列・マップは、すべて `Object.freeze` で凍結され、生成後の変更は一切禁止される。
- AIによる予測（No Prediction）や自動的な異常検出結果は一切格納しない。
