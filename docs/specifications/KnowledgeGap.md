# 知識不足領域仕様書 (Knowledge Gap Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、頻発するルール違反や修正の成功パターンがあるにもかかわらず、それを解決するためのナレッジがデータベース内に存在しない、または不足している「ナレッジの欠落領域（Knowledge Gap）」を分析・検知する仕様を定義する。

---

## 責務
- 過去のレビュー違反実績とナレッジの網羅率（Coverage）をクロス分析。
- 不足領域オブジェクト（Knowledge Gap）の検出および優先度の算定。
- **自動ナレッジ生成の絶対禁止**: 不足領域を検出して人間または後続モジュールに警告（Alert）する役割に徹し、自動で新しいナレッジを創作・挿入することは行わない。

---

## ナレッジ不足（Gap）の検出条件

最適化エンジンは、以下のいずれかの状態を検知した際に `Knowledge Gap` としてレポートに報告する。

### 1. 解決策不足 (Missing Resolution Gap)
- **検出条件**: 
  - 特定のレビュー検証項目（例: AI Smell Level 2 違反など）が直近3回のレビューで2回以上発生しているにもかかわらず、そのエラーに対応する有効（Healthy）な解決推薦ナレッジがナレッジベースに1件も存在しない場合。

### 2. 未昇格の成功パターン (Unpromoted Success Gap)
- **検出条件**:
  - 自己改善（Self Improvement）で高い改善効果（Delta >= 15.0）を上げた特定のコード差分パターンが複数回検出されているが、それが知識進化（Knowledge Evolution）の `Candidate` または `Official` ナレッジとして登録されていない場合。

### 3. カテゴリ不均衡 (Category Imbalance Gap)
- **検出条件**:
  - `Architecture` や `Human Engineering` などの極めて重要度の高いコア領域において、ルール違反件数に対するナレッジカバレッジ（解決可能なナレッジの割合）が 30% を下回っている場合。

---

## 不足領域のデータモデル (Knowledge Gap Model)
検出されたギャップ情報の表現構造。

```json
{
  "gapId": "GAP-2026-0104",
  "category": "Architecture",
  "targetRuleId": "RULE-ARCH-THIN-FRONTEND",
  "violationFrequency": 12,
  "status": "UNRESOLVED",
  "analysis": {
    "reason": "フロントエンド側での SpreadsheetApp 直接呼び出し違反が多発していますが、GAS APIへ仲介するためのリファクタリング用推奨ナレッジが存在しません。",
    "priority": "High"
  }
}
```
