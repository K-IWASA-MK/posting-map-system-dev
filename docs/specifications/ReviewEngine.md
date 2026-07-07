# レビューエンジン仕様書 (Review Engine Specification)

## 目的
AIOS（品質保証オペレーティングシステム）における品質保証の中核となるレビューエンジン（Review Engine）の仕様を定義する。AIOSが開発したコードやドキュメントを自律的にレビューし、品質の自己改善ループを回すための基盤である。

## 責務
- システムの品質基準および設計ルールの適合性監査。
- 開発AIに対する機械的・論理的・構造的・UX的レビューの実行。
- 検出された問題点に基づく具体的な改善提案の自動生成。
- レビュー履歴の蓄積とナレッジベースへのフィードバック。

## レビューのライフサイクル (Review Lifecycle)
レビューは以下のライフサイクルに従って実行され、永続化される。
1. **トリガー (Trigger)**: コードの変更（Commit/PR）または設計仕様の変更を検知して自動起動。
2. **実行コンテキスト構築 (Context Creation)**: 変更差分（Diff）、依存関係マップ、過去のインシデント履歴からコンテキストを生成。
3. **パイプライン実行 (Pipeline Execution)**: 各レビューレイヤーを順次、非同期または決定論的に実行。
4. **判定マージ (Decision Merge)**: 各ステージの評価を統合し、総合スコアと最終判定（PASS/WARNING/FAIL）を決定。
5. **フィードバック & 改善ループ (Improvement Loop)**: 却下された場合は改善提案を出力し、開発エージェントが再実装を実施。再レビューへ自動接続。
6. **テレメトリー更新 (Telemetry & Knowledge)**: レビュー結果と教訓（Lesson Learned）をナレッジベースに記録。

## 改善ループ (Improvement Loop)
レビュー結果が `FAIL` または `WARNING` の場合、レビューエンジンは以下のフローで自律的改善を要求する。
```
レビューエンジン (FAIL判定) ──> 改善提案書 (Improvement Proposal) 生成
                                              │
                                              ▼
修正実行 (Auto Fix/Developer) ──> 再レビュー実行 (Re-review)
                                              │
                                              ▼
                                       総合判定判定
```
改善提案書には、修正すべき対象ファイル、問題コード位置、違反したルールID、および具体的な修正コード例（Diff形式）を含まなければならない。

## レビュー結果スキーマ (Review Result Schema)
レビュー結果は以下のJSONスキーマに従い、決定論的に構造化して出力される。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReviewResult",
  "type": "object",
  "properties": {
    "reviewId": { "type": "string" },
    "status": { "type": "string", "enum": ["PASS", "WARNING", "FAIL"] },
    "score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "stages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "stageName": { "type": "string" },
          "status": { "type": "string", "enum": ["PASS", "WARNING", "FAIL"] },
          "findings": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "file": { "type": "string" },
                "line": { "type": "integer" },
                "severity": { "type": "string", "enum": ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                "message": { "type": "string" },
                "ruleId": { "type": "string" }
              },
              "required": ["file", "severity", "message"]
            }
          }
        },
        "required": ["stageName", "status"]
      }
    },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["reviewId", "status", "score", "stages", "timestamp"]
}
```

## 評価スコア構造 (Review Score Structure)
総合評価スコア（0〜100）は、以下の基準に基づいて計算される。

- **100点 (完全適合)**: 警告や違反が一切検出されなかった状態。
- **80点以上 (警告あり)**: 軽微な推奨事項（WARNING）が存在するが、リリース可能な状態。
- **80点未満 (却下)**: 重大な設計違反（FAIL）またはクリティカルなバグが1件以上検出された状態。リリース不可。

### 重大度（Severity）分類
- **CRITICAL**: セキュリティ脆弱性、またはシステム全体のクラッシュを引き起こす違反（即時FAIL）。
- **HIGH**: 責務境界の違反、またはアーキテクチャ定義への違反（即時FAIL）。
- **MEDIUM**: パフォーマンス低下や、可読性を損なう構造の違反（警告）。
- **LOW/INFO**: 命名規則の微細な不一致、またはドキュメント表記の揺れ（情報提供）。

## 設計哲学 (Review Philosophy)
- **資産としてのレビュー**: レビュー結果は一過性の会話ログではなく、再利用可能な構造化知識（JSON/Markdown）として記録する。
- **自己規制OS**: AIOS自身がルールとコードの整合性を監査・強制し、リリース品質のばらつきをゼロにする。
- **決定論的ゲート**: 評価ロジックとマージポリシーをコードと設定（Schema）で制御し、モデルの気まぐれに左右されない客観的な品質保証を行う。
