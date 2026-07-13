# 学習エンジン仕様書 (Learning Engine Specification)

## 設計思想 (Philosophy)
> 学習とは単なる記録（ログ）の蓄積ではない。
> 品質向上が実証された改善結果を抽出し、
> 再利用可能な「構造化ナレッジ（知識資産）」へと昇格させる決定論的プロセスである。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、過去のレビュー、スコア変化、自己改善および推薦の全プロセスから得られた経験データを解析し、品質を自己進化させるための「学習エンジン（Learning Engine）」の基盤を定義する。

---

## 責務
- 改善履歴および品質差分（Delta）のデータから、再利用可能な「改善パターン」を特定するパターン解析（Pattern Analysis）の実行。
- 抽出されたパターンが本当に知識として昇格可能かを評価する「知識検証（Knowledge Validation）」の制御。
- 検証を通過したパターンをバージョン管理可能な形式に昇格する「知識進化（Knowledge Evolution）」の管理。
- 蓄積された知識から、次のレビューおよび改善実行時に最適な解決策を提案する「推薦（Recommendation）」の実行。
- 推薦した解決策が効果的であったかを評価する「推薦フィードバックループ」の管理。

---

## 学習ライフサイクル (Learning Lifecycle)
学習プロセスは、以下の段階的ステップに従って実行される。

```
[自己改善完了] ──> [1. 学習起動 (Learning Trigger)] ──> [2. パターン抽出 (Pattern Analysis)]
                                                                  │
                                                                  ▼
[知識最適化へ] <── [4. 知識進化 (Knowledge Evolution)] <── [3. 知識検証 (Knowledge Validation)]
```

1. **学習起動**: 自己改善（Self Improvement）フェーズの完了（またはPASS）を検知して自動起動。
2. **パターン抽出**: 品質スコアの Delta がプラスとなった改善内容から、再現性のあるコードパターンや構造的特徴を抽出。
3. **知識検証 (Knowledge Validation)**:
   - 抽出された改善パターンが以下の昇格基準を満たしているかを監査する。
     - **再現性 (Repeatability)**: 同一の課題に対して他の箇所でも適用可能か。
     - **汎用性 (Generality)**: 複数の画面やプロジェクトで有効か。
     - **実証性 (Proven Delta)**: 改善前後で品質スコアの Delta が明確に向上しているか。
     - **持続性 (Sustainability)**: 一時的な場当たり的修正（クイックハック）ではないか。
4. **知識進化 (Knowledge Evolution)**: 知識のバージョン更新と、信頼性成熟度の付与。
5. **知識最適化への接続 (Knowledge Optimization)**: ナレッジの進化処理（昇格・降格・バージョン更新）が完了した後、その更新データおよびナレッジベース全体の健全性を評価・分析・クレンジングするため、後続の「知識最適化エンジン（Knowledge Optimization Engine）」へ処理を移管する。

---

## 学習ソース (Learning Sources)
学習エンジンは、AIOS内の以下のコンポーネントからすべての評価・実績データを集約する。
- **Review Engine / Architecture Review / AI Smell Detector / Human Engineering**: ルール違反およびAI臭の検出履歴。
- **Quality Score Engine**: 個別カテゴリおよびOverallスコアの評価データ。
- **Self Review Engine**: 改善要否判定（Decision）と改善停止履歴（Stop Rule）。
- **Self Improvement Engine**: 適用された実行ユニット（Execution Unit）と検証結果、品質差分（Delta）。
- **Output Engine**: 日本語化およびフォーマットの適合データ。

---

## 将来拡張ポイント (Future Extensions)
- **分散型連合学習 (Federated Knowledge Sharing)**:
  独立して稼働する複数のクライアント環境（例: MIE-03, TOKYO-01）のAIOS間で、ローカルの機密ソースコードを共有することなく、実証された品質改善の「メタ知識」のみをセキュアに共有し合い、システム全体で知識を同期進化させる機能。
