# 改善履歴仕様書 (Improvement History Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、自律的な品質改善ループ（Improvement Loop）の各実行結果、改善前の状態、適用した修正、および改善後の品質変化を「改善履歴（Improvement History）」としてデータベースに記録・蓄積するためのデータモデルを定義する。

---

## 履歴の永続化パラメータ
改善履歴レコードには、以下の項目が保存される。

- **レビューID (Review ID)**: 対象のレビュー処理を一意に識別する識別子。
- **課題内容 (Issue)**: 検出された具体的なルール違反や不整合の内容。
- **優先順位 (Priority)**: 適用された改善優先度（P1〜P4）。
- **改善分類 (Improvement Type)**:
  - どのような性質の改善かを識別する分類コード。
  - 分類：`Architecture`, `Design`, `UX`, `Human Engineering`, `Output`, `Runtime`, `AI Smell`, `Documentation`
- **改善推奨策 (Recommendation)**: 提示された修正推奨の内容。
- **選択された解決策 (Selected Solution)**: 実際に自動修正で適用されたコード（Diff情報）。
- **再レビュー結果 (Review Result)**: 改善後の判定（PASS/WARNING/FAIL）。
- **改善前スコア (Quality Score Before)**: 修正前のOverall Score。
- **改善後スコア (Quality Score After)**: 修正適用後のOverall Score。
- **実行日時 (Timestamp)**: 改善処理が行われた日時。

---

## 改善履歴スキーマ (Improvement History Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ImprovementHistoryRecord",
  "type": "object",
  "properties": {
    "historyId": { "type": "string" },
    "reviewId": { "type": "string" },
    "issue": { "type": "string" },
    "priority": { "type": "string", "enum": ["P1", "P2", "P3", "P4"] },
    "improvementType": {
      "type": "string",
      "enum": [
        "Architecture",
        "Design",
        "UX",
        "Human Engineering",
        "Output",
        "Runtime",
        "AI Smell",
        "Documentation"
      ]
    },
    "recommendation": { "type": "string" },
    "selectedSolution": {
      "type": "object",
      "properties": {
        "appliedDiff": { "type": "string" },
        "filesModified": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["appliedDiff", "filesModified"]
    },
    "reviewResult": { "type": "string", "enum": ["PASS", "WARNING", "FAIL"] },
    "qualityScoreBefore": { "type": "number", "minimum": 0, "maximum": 100 },
    "qualityScoreAfter": { "type": "number", "minimum": 0, "maximum": 100 },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": [
    "historyId",
    "reviewId",
    "issue",
    "priority",
    "improvementType",
    "recommendation",
    "selectedSolution",
    "reviewResult",
    "qualityScoreBefore",
    "qualityScoreAfter",
    "timestamp"
  ]
}
```

---

## 将来の分析および学習との連携 (Future Integration)
この改善履歴データは、以下の時系列分析で利用される。
- **改善型トレンド分析**: 蓄積された履歴データから「どのファイルにどのような修正を適用した結果、品質スコアが何点向上したか（あるいは低下したか）」を統計分析し、将来的な自己改善エンジンの「改善方針決定精度」の最適化モデルとして利用する。
- **改善傾向レポート**: スプリント単位で `Improvement Type` の集計を行い、「当期スプリントはUXの改善（P2）が多く発生した」などの品質ボトルネック箇所を抽出する品質監視ダッシュボードとの連携。
