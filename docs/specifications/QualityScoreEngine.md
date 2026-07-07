# 品質スコアエンジン仕様書 (Quality Score Engine Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、Review Engineおよびその配下の各サブレビュープロセスから出力される評価データを統合し、プロダクト全体の品質を構造的かつ定量的に評価・可視化する「品質スコアエンジン（Quality Score Engine）」の仕様を定義する。

---

## 責務
- 各レビューレイヤー（構造、仕様、人間工学、意匠、操作性、実行時、出力、AI臭）の検証結果を単一の構造化スキーマ（ScoreSchema）に集約。
- プロダクトの特性に応じた各カテゴリの「重み付け（Weight）」の適用と、最終的な「総合スコア（Overall Score）」の算出。
- 検出された問題点に対し、点数の低さだけでなく、プロダクトとしての致命度から「改善優先順位（Priority: P0/P1/P2/P3）」を自動付与。
- 品質データの時系列推移を追跡・記録する基盤の提供。

---

## 品質スコアモデル (Quality Score Model)
品質スコアは、各評価カテゴリから抽出された個別スコアを統合し、重要度に応じた加重平均によって総合スコアを決定するモデルである。

### 重み付け設計 (Weighting Design)
各カテゴリには、システム全体への影響度と「人間工学（UX/AI臭）」の重要度に基づいて、以下の標準的な重み（Weight）が設定される。

| カテゴリ | 標準比重 (Weight) | 責務・評価対象の概要 |
|---|---|---|
| **Architecture** | 15% | 階層分離、薄いフロントエンド原則、GAS責務、Single API |
| **Product** | 15% | 仕様適合性、Mission Control思想、ブランド一貫性 |
| **Human Engineering** | 15% | 現場実運用性、第0原則、Emotion、Craftsmanship、Identity |
| **Design** | 10% | Typography, Color, Spacing, Layout, Glass, Motion |
| **UX** | 10% | ユーザー行動短縮、情報密度、操作導線 |
| **Runtime** | 10% | 描画性能、API数、JSONサイズ、Animation |
| **Output** | 10% | 日本語品質、構造統一、コピー性、フォーマット品質 |
| **AI Smell** | 15% | AI特有のテンプレート感、均等グリッド、過剰Glow等の検出レベル |
| **合計** | **100%** | |

### 総合スコア (Overall Score) の算出式
総合スコアは、各カテゴリのスコア $S_i$ と重み $W_i$ による以下の加重平均式で定義される。
$$OverallScore = \sum_{i} (S_i \times W_i)$$

---

## 評価ライフサイクル (Score Lifecycle)
1. **収集 (Collection)**: パイプラインの最終段階において、各レビューエンジンの検出データ（違反件数、重要度、信頼度）を収集。
2. **評価 (Evaluation)**: スコアモデル（ScoreModel）に基づき、カテゴリごとの基本スコアと信頼度を適用。
3. **優先順位付け (Prioritization)**: 違反ルールIDとAI臭レベル等から、即時修正が必要なものに `Priority`（P0〜P3）を設定。
4. **統合マージ (Synthesis)**: `ScoreSchema` に準拠した単一の品質状態JSONを構築し、総合スコア（Overall Score）を計算。
5. **出力接続 (Output Integration)**: 生成された品質JSONデータを Output Engine に引き渡し、最終報告テキストを構築。

---

## 将来拡張ポイント (Future Extensions)

### 1. 品質推移の追跡 (Quality Trend)
各スプリント（例: Sprint 12 -> 96.2, Sprint 13 -> 96.9, Sprint 14 -> 97.4）ごとの Overall Score を履歴データベースに永続化し、プロダクト品質が継続的に改善しているかを可視化する時系列推移アルゴリズム。

### 2. 信頼度の適応補正 (Adaptive Confidence Control)
判定信頼度（Confidence）が `Low` の項目について、自動的に人間の承認（Human Approval）ゲートの優先査読リストにエスカレーションし、人間の判定結果を再学習させてAIの評価精度を向上させる補正機能。
