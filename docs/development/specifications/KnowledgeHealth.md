# 知識健全性仕様書 (Knowledge Health Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、蓄積されたナレッジベース内の個々のナレッジが、現在も有効かつ安全に機能しているかを定量測定するための評価項目および健康状態（Health Status）の分類モデルを定義する。

---

## 健全性評価項目 (Health Evaluation Items)
個別ナレッジの健康評価は、以下の静的・動的メトリクスを統合して「Health Score（0〜100）」として算出される。

- **Health Score (健康度スコア)**:
  - ナレッジの全体的な有効性を表す0〜100の総合値。成功率や鮮度を考慮して決定論的に計算。
- **Confidence Trend (信頼度推移)**:
  - 学習履歴に記録された `Confidence`（信頼度）の直近5回での変化傾向（上昇傾向、停滞、下降傾向）。
- **Usage Frequency (利用頻度)**:
  - スプリント内で当該ナレッジが開発エージェントによって適用・参照された回数。
- **Success Rate (成功率)**:
  - 当該ナレッジを適用した改善で、検証フェーズが PASS し、かつ品質 Delta がプラスとなった確率（ロールバック未発生率）。
- **Recommendation Adoption (推薦採択率)**:
  - 推薦エンジンから提案された解決策に対して、開発エージェントが実際にその推薦をコードに採用した率。
- **Freshness (新鮮度) & Age (経過時間)**:
  - 最終更新日からのスプリント経過数（時間経過による形骸化の判定基準）。

---

## 健康状態 (Health Status Categorization)
健康評価のスコアおよび利用実態に基づき、ナレッジには以下の健康状態が付与される。

| 健康状態 (Status) | 判定条件 | 状態解説 |
|---|---|---|
| **Healthy (極めて健全)** | Health Score >= 85 且つ 成功率 >= 90% | 非常に高い品質を維持し、頻繁に利用されている状態。 |
| **Stable (安定)** | 70 <= Health Score < 85 且つ 成功率 >= 80% | 安定して稼働しており、デグレードの心配がない状態。 |
| **Warning (警告)** | Health Score < 70 又は 直近のロールバック発生率 > 20% | 品質低下の兆候があり、適用時にデグレードを引き起こしやすい状態。 |
| **Stale (形骸化)** | 経過時間（Age）が一定以上 且つ 直近3スプリントでの利用回数が0回 | 技術やUIトレンドの変更により、事実上使われなくなっている状態。 |
| **Deprecated (非推奨化)** | 知識進化によって非推奨判定を受けたもの | 廃止待機中の状態。 |

---

## 健康度評価モデル (Evaluation Logic Schema)
健康状態を評価・計算するためのモデル定義。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KnowledgeHealthEvaluation",
  "type": "object",
  "properties": {
    "knowledgeId": { "type": "string" },
    "healthScore": { "type": "number", "minimum": 0, "maximum": 100 },
    "status": {
      "type": "string",
      "enum": ["Healthy", "Stable", "Warning", "Stale", "Deprecated"]
    },
    "metrics": {
      "type": "object",
      "properties": {
        "successRate": { "type": "number" },
        "usageCount": { "type": "integer" },
        "adoptionRate": { "type": "number" },
        "ageInSprints": { "type": "integer" }
      }
    }
  },
  "required": ["knowledgeId", "healthScore", "status", "metrics"]
}
```
