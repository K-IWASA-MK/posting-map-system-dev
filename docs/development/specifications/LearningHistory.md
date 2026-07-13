# 学習履歴仕様書 (Learning History Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、学習プロセスから得られたパターン分析結果、知識のバージョン昇格・廃止記録、および推薦フィードバックのデータを「学習履歴（Learning History）」として時系列に記録・永続化するためのデータ構造を定義する。

---

## 履歴の永続化モデル

学習履歴は、以下のサブ履歴モジュールを統合する時系列インデックスモデルとして構造化される。

- **レビュー履歴 (Review History)**: 過去のルール違反検出件数および合格率の記録。
- **品質スコア履歴 (Quality History)**: スプリントごとの Overall Score およびカテゴリ別スコアの時系列記録（Quality Trend データのソース）。
- **改善履歴 (Improvement History)**: 実行された修正コード差分（Diff）および改善量（Delta）の記録。
- **パターン履歴 (Pattern History)**: 成功・失敗パターンとして抽出された一時的な記述の記録。
- **知識更新履歴 (Knowledge Update History)**: ナレッジの成熟度（Experimental / Candidate / Official）の昇格、および非推奨・アーカイブ化（Deprecation）のタイムスタンプ記録。
- **推薦フィードバック履歴 (Recommendation History)**: 提示された推薦案が採用され、どのような品質効果（Delta）をもたらしたかの結果データ。

---

## 学習履歴スキーマ (Learning History Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LearningHistoryRecord",
  "type": "object",
  "properties": {
    "historyId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "sprintId": { "type": "string" },
    "type": {
      "type": "string",
      "enum": [
        "ReviewSummary",
        "QualityTrendPoint",
        "PatternIdentified",
        "KnowledgePromotion",
        "KnowledgeDeprecation",
        "RecommendationFeedback"
      ]
    },
    "details": {
      "type": "object",
      "properties": {
        "targetCategory": { "type": "string" },
        "knowledgeId": { "type": "string" },
        "version": { "type": "string" },
        "previousState": { "type": "string" },
        "newState": { "type": "string" },
        "deltaValue": { "type": "number" },
        "successRate": { "type": "number" },
        "feedbackResult": { "type": "string", "enum": ["EFFECTIVE", "INEFFECTIVE", "ROLLBACK"] }
      }
    }
  },
  "required": ["historyId", "timestamp", "sprintId", "type", "details"]
}
```

---

## 将来の分析および学習との連携 (Future Integration)
学習履歴データは、将来的に以下の用途で使用される。
- **知識最適化エンジン (Knowledge Optimization Engine) との連携**:
  重複したナレッジや競合する推薦を自動的にクレンジング・マージするための監査データ。
- **自己進化トレンド可視化**:
  AIOSが各スプリントを通じてどの分野で「失敗パターン」を減らし、「成功パターン」を増やしたかをグラフィカルに可視化する履歴レポートの生成。
