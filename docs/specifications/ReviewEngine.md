# レビューエンジン仕様書 (Review Engine Specification)

## 目的
AIOS（品質保証オペレーティングシステム）における品質保証の中核となるレビューエンジン（Review Engine）の仕様を定義する。AIOSが開発したコードやドキュメントを自律的にレビューし、品質の自己改善ループを回すための基盤である。

## 責務
- システムの品質基準および設計ルールの適合性監査。
- 開発AIに対する機械的・論理的・構造的・UX的レビューの実行。
- 検出された問題点に基づく具体的な改善提案の自動生成。
- レビュー履歴の蓄積とナレッジベースへのフィードバック。
- **品質スコアエンジン（Quality Score Engine）へのレビュー評価データの受け渡し。**

---

## レビューフロー (Review Flow)
レビューは以下のフロー順序に従って決定論的に実行される。

1. **Architecture Review (構造)**: 階層構造・一方向依存の適合性検証。
2. **Product Review (仕様)**: 機能要求・受け入れ基準の適合性検証。
3. **Human Engineering Review (人間工学)**: AI臭（AI Smell）の排除、生命感、現場実用性の適合性検証。
4. **Design Review (意匠)**: 漆黒UI、ガラスUI、配色規律の適合性検証。
5. **UX Review (操作性)**: アニメーション、操作性、1pxの規律の適合性検証。
6. **Runtime Review (実行時)**: 実行時性能、通信構造、APIコール数の検証。
7. **AI Smell Review (AI臭検出)**: AI特有の不自然さの検出レベルの判定。
8. **Quality Score (品質スコアリング)**: 各評価データの集約、重み付け、総合スコアと改善優先順位（Priority）の算出。
9. **Output Engine (出力制御)**: 品質スコアデータに基づいた出力フォーマット、日本語優先規律の適用。
10. **PASS (合格)**

---

## レビューデータの伝播フロー (Data Propagation Flow)
AIOS内のデータ連携は、以下の階層的な一方向フローを厳守する。

```
[各レビューレイヤー (検証実行)] ──(生データ)──> [Review Engine (集約)]
                                                         │
                                                         ▼
[Output Engine (日本語化/出力)] <──(ScoreSchema JSON)── [Quality Score Engine (スコア算出/優先順位付)]
```

1. **Review Engine**: 各検証ステージを実行し、検出されたルール違反等の生ログを収集。
2. **Quality Score Engine**: 生ログを解析し、カテゴリ別スコア、優先順位（Priority）、および信頼度（Confidence）を計算して `ScoreSchema` 準拠のJSONデータを生成。
3. **Output Engine**: 品質スコアJSONデータを受信し、人間（岩佐CEO）がそのまま読める実績説明書や改善推奨テキストにフォーマット整形して出力。

---

## レビューのライフサイクル (Review Lifecycle)
レビューは以下のライフサイクルに従って実行され、永続化される。
1. **トリガー (Trigger)**: コードの変更（Commit/PR）または設計仕様の変更を検知して自動起動。
2. **実行コンテキスト構築 (Context Creation)**: 変更差分（Diff）、依存関係マップ、過去のインシデント履歴からコンテキストを生成。
3. **パイプライン実行 (Pipeline Execution)**: 各レビューレイヤーを順次、非同期または決定論的に実行。
4. **品質スコアリング (Scoring)**: Quality Score Engine が評価結果から総合品質指数を算出。
5. **フィードバック & 改善ループ (Improvement Loop)**: 却下（FAIL）された場合は改善提案を出力し、開発エージェントが再実装を実施。再レビューへ自動接続。
6. **テレメトリー更新 (Telemetry & Knowledge)**: レビュー結果と教訓（Lesson Learned）をナレッジベースに記録。

---

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
