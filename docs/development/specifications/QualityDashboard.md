# 品質ダッシュボード仕様書 (Quality Dashboard Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、現在進行している開発スプリントおよび過去のコミット履歴における品質検証結果（Quality Score や各レビュー判定）をダッシュボード上に一元表示するための表示モデルを定義する。

---

## 観測原則 (Observer Boundaries)
- **再計算の禁止 (No Recalculation)**:
  - 品質ダッシュボードは、総合スコアや比重の再計算、AI Smell 判定のやり直しなどの判定・論理処理を一切行わない。
  - 既存の `Quality Score Engine` および各種レビューエンジンが出力した静的な検証データを受け取り、そのままUIへマッピングして表示する。

---

## 表示対象およびデータマッピング (Display Targets)
ダッシュボードは、以下のデータソースと表示項目を直接マッピングして描画する。

### 1. 総合品質スコア (Quality Score)
- **入力ソース**: `QualityScore JSON` (Overall Score, Category Scores)。
- **表示項目**: 総合点数（例: `84 / 100`）、優先順位（Priority）、信頼度（Confidence）。

### 2. レビュー実行結果 (Review Results)
- **入力ソース**: 各個別レビューの監査結果。
- **表示項目**: 各カテゴリ（Architecture, Design, UX, Human Engineering, Runtime, AI Smell）ごとの `PASS` / `FAIL` / `WARNING` 判定と、検出されたルール違反の一覧。

### 3. 自己レビュー結果 (Self Review Results)
- **入力ソース**: `Self Review` の判定データ。
- **表示項目**: 改善要否判定（Improvement Decision: 要改善か否か）、および判定の理由。

### 4. 自己改善結果 (Self Improvement Results)
- **入力ソース**: `Self Improvement` の履歴データ。
- **表示項目**: 適用された改善タスク、検証結果、および改善量（Delta: $Score(After) - Score(Before)$）。

---

## 品質表示データ構造 (Quality Display Model Schema)
ダッシュボードが描画時に使用する内部統合データ構造。

```json
{
  "commitHash": "3adecc581d7f",
  "timestamp": "2026-07-07T21:30:59Z",
  "overallScore": 84,
  "priority": "P1",
  "confidence": "High",
  "categories": [
    { "name": "Architecture", "score": 90, "status": "PASS" },
    { "name": "AI Smell", "score": 60, "status": "WARNING", "detail": "Level 1 AI Smell detected." }
  ],
  "selfReview": {
    "decision": "AUTO_IMPROVE",
    "reason": "AI Smell Level 1 を自動改善対象として認識。"
  },
  "improvement": {
    "delta": 12.5,
    "tasksCompleted": 1
  }
}
```
