# 知識最適化エンジン仕様書 (Knowledge Optimization Engine Specification)

## 設計思想 (Philosophy)
> 知識最適化は、新しいナレッジを生成したり自動で改変したりするエンジンではない。
> 蓄積された知識の鮮度、重複、およびギャップ（不足）を客観的に評価し、
> ナレッジベース全体の品質と有用性を維持するための「品質管理・整理レイヤー」である。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、Learning Engineが保存したナレッジに対し、自動評価・統計処理を行い、重複（Merge）や不足（Gap）を洗い出した分析レポートおよびステータス推奨を生成する「知識最適化エンジン（Knowledge Optimization Engine）」の基盤を定義する。

---

## 責務
- ナレッジごとの健康度スコア（Health Score）を測定し、状態判定を行う。
- 重複、類似、断片化されたナレッジを洗い出し、統合候補（Merge Candidates）として検出。
- レビューの発生分布とナレッジの適合率から、ナレッジが不足している「Gap領域」を検知。
- ナレッジベース全体の健全性を把握するための統計情報（Metrics）の集計。
- ガードレール：**自動削除、自動マージ、自動ナレッジ生成は一切行わず、評価・提示のみに限定する。**

---

## 最適化判定 (Optimization Decision)
評価結果に基づき、各ナレッジに対して以下の推奨アクション（Optimization Decision）を付与する。本エンジンは状態を判定して返すだけであり、**実際の削除・マージ実行は一切行わない。**

| 推奨判定 (Decision) | 判定基準の例 | 意図する制御アクション |
|---|---|---|
| **Healthy (健全)** | 成功率が高く、鮮度（Freshness）も維持されている。 | 維持（特になし） |
| **Monitor (経過観察)** | 成功率が微減しているか、直近スプリントで採用されていない。 | 利用状況の監視継続。 |
| **Recommend Merge (統合推奨)** | 他のナレッジと内容が極めて類似または重複している。 | 後続モジュール（人間または最適化実行部）へ統合案を提示。 |
| **Recommend Update (更新推奨)** | 鮮度や信頼度（Confidence）が低下しており、一部のルール適合に不整合がある。 | ナレッジの見直し・修正候補として提示。 |
| **Recommend Archive (アーカイブ推奨)** | 直近でロールバックの原因となっているか、Deprecatedルールへ移行済み。 | 推薦対象からの除外（非アクティブ化）を提示。 |

---

## 知識最適化レポートモデル (Knowledge Optimization Report Model)
最適化処理の結果として出力されるレポートの論理構造。将来の Governance Engine や Dashboard UI が直接利用できるように定義する。

```json
{
  "reportId": "OPT-2026-0819",
  "timestamp": "2026-07-07T21:18:46Z",
  "metricsSnapshot": {
    "totalKnowledge": 42,
    "averageHealth": 88.5,
    "experimentalRatio": 0.25,
    "candidateRatio": 0.50,
    "officialRatio": 0.25
  },
  "healthSummary": {
    "healthyCount": 35,
    "warningCount": 5,
    "staleCount": 2
  },
  "mergeCandidates": [
    {
      "candidateId": "MC-001",
      "targetKnowledgeIds": ["KNW-004", "KNW-012"],
      "similarityScore": 0.92,
      "reason": "ボトムナビの配色に関するルール表記が完全に重複しています。"
    }
  ],
  "gapSummary": [
    {
      "gapId": "GAP-001",
      "category": "Human Engineering",
      "ruleId": "RULE-HE-002",
      "violationCount": 15,
      "reason": "当該人間工学ルールでの違反が多発していますが、解決用の推奨ナレッジが存在しません。"
    }
  ]
}

---

## 後続エンジンへの接続 (Pipeline Integration)
知識最適化処理が完了し、`Knowledge Optimization Report` が生成された後、本エンジンは処理フローを直接実行層へ受け渡すのではなく、ルール適合判定および承認監査を統制するため、後続の「ガバナンスエンジン（Governance Engine）」へレポートデータを引き渡す。

- **連携トリガー**: 最適化レポート（`Knowledge Optimization Report`）の作成完了。
- **引き渡しデータ**: 生成されたレポートオブジェクト全体。
- **境界制御**: 最適化エンジン自身はガバナンスルール（例: 承認の要否）を判断せず、分析結果の出力データ提供のみを行う。
```
