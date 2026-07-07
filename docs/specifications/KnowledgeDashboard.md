# 知識ダッシュボード仕様書 (Knowledge Dashboard Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ナレッジベース内の全ナレッジ数、成熟度、健全性評価、および最適化の余地（統合候補や不足領域）をダッシュボード上に可視化するための表示モデルを定義する。

---

## 観測原則 (Observer Boundaries)
- **分析の禁止**: 知識ダッシュボードは、どのナレッジを統合すべきか、何が不足しているかの分析処理は一切行わない。
- **入力ソースの固定**: 
  - 後続の `Knowledge Optimization Engine` が出力する `Knowledge Optimization Report` (Metrics / Health / Merge / Gap) のみを唯一の入力ソースとして表示を行う。

---

## 表示対象およびデータマッピング (Display Targets)
ダッシュボードは、以下の項目と最適化レポートデータをマッピングして描画する。

### 1. ナレッジ総数および構成 (Knowledge Inventory)
- **マッピングデータ**: `metricsSnapshot` の `totalKnowledge` および各成熟度比率（`officialRatio`, `candidateRatio`, `experimentalRatio`）。
- **表示項目**: 登録されているナレッジの総数、および円グラフ等による成熟度別の割合表示。

### 2. 平均健康度および信頼度 (Average Health & Confidence)
- **マッピングデータ**: `metricsSnapshot` の `averageHealth` および個々のナレッジ健康度（`healthSummary`）。
- **表示項目**: ナレッジベース全体の平均健康値、および `Warning` や `Stale` 状態にある危険ナレッジの数。

### 3. 統合候補リスト (Merge Candidates List)
- **マッピングデータ**: `mergeCandidates` 配列。
- **表示項目**: 重複・類似と判定されたナレッジID、類似度スコア、および統合が推奨される理由のリスト。

### 4. 不足領域サマリー (Knowledge Gap Summary)
- **マッピングデータ**: `gapSummary` 配列。
- **表示項目**: 未解決のルールID、違反多発回数、ナレッジ作成が強く推奨されるギャップ領域のリスト。

---

## 知識表示データ構造 (Knowledge Display Model Schema)
ダッシュボードが描画時に使用する内部統合データ構造。

```json
{
  "timestamp": "2026-07-07T21:18:46Z",
  "totalKnowledgeCount": 42,
  "ratios": {
    "official": 0.25,
    "candidate": 0.50,
    "experimental": 0.25
  },
  "health": {
    "average": 88.5,
    "warningCount": 5,
    "staleCount": 2
  },
  "mergeCandidatesCount": 1,
  "gaps": [
    { "gapId": "GAP-001", "category": "Human Engineering", "ruleId": "RULE-HE-002", "violationCount": 15 }
  ]
}
```
