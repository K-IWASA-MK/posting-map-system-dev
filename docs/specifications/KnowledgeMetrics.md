# 知識統計指標仕様書 (Knowledge Metrics Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ナレッジベース全体の規模、成熟度、健全性、および最適化の余地を定量的に可視化するための統計指標（Knowledge Metrics）のデータモデルおよび集計項目を定義する。

---

## 統計指標項目 (Metrics Items)
知識最適化エンジンは、スプリントの実行完了ごとに、ナレッジベース全体の統計情報として以下のメトリクスを算出する。

### 1. 規模および成熟度指標 (Scale & Maturity Metrics)
- **Total Knowledge (総ナレッジ数)**:
  - ナレッジベース内に登録されている全ナレッジ（状態問わず）の総数。
- **Official Ratio (公式ナレッジ割合)**:
  - 全ナレッジにおける `Official` レベルの割合（$Official / Total$）。
- **Candidate Ratio (候補ナレッジ割合)**:
  - 全ナレッジにおける `Candidate` レベルの割合（$Candidate / Total$）。
- **Experimental Ratio (実験的ナレッジ割合)**:
  - 全ナレッジにおける `Experimental` レベルの割合（$Experimental / Total$）。
- **Deprecated Ratio (非推奨ナレッジ割合)**:
  - 全ナレッジにおける `Deprecated` レベルの割合（$Deprecated / Total$）。

### 2. 健全性および有効性指標 (Health & Quality Metrics)
- **Average Confidence (平均信頼度)**:
  - 有効な全ナレッジにおける信頼度スコアの算術平均値。
- **Average Health (平均健康度)**:
  - 有効な全ナレッジにおける `Health Score` の算術平均値。
- **Freshness Score (全体鮮度スコア)**:
  - ナレッジの更新頻度と、技術仕様書のバージョン追従状況から計算される、知識ベース全体の鮮度（0〜100）。

### 3. 最適化余地指標 (Optimization Opportunity Metrics)
- **Merge Candidate Count (統合候補数)**:
  - 検出された重複・類似などの統合推奨（Recommend Merge）ナレッジの総数。
- **Gap Count (不足領域数)**:
  - 検出されたナレッジ不足領域（Knowledge Gap）の総数。

---

## 統計指標データ構造 (Metrics Schema)
算出される統計情報の論理構造。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KnowledgeMetricsSnapshot",
  "type": "object",
  "properties": {
    "snapshotId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "metrics": {
      "type": "object",
      "properties": {
        "totalKnowledge": { "type": "integer" },
        "ratios": {
          "type": "object",
          "properties": {
            "official": { "type": "number" },
            "candidate": { "type": "number" },
            "experimental": { "type": "number" },
            "deprecated": { "type": "number" }
          }
        },
        "averageConfidence": { "type": "number" },
        "averageHealth": { "type": "number" },
        "freshnessScore": { "type": "number" },
        "mergeOpportunityCount": { "type": "integer" },
        "gapOpportunityCount": { "type": "integer" }
      }
    }
  },
  "required": ["snapshotId", "timestamp", "metrics"]
}
```
