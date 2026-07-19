# Quality Runtime 仕様書

## 概要
本仕様書は、AIOS における品質判定および自己監査を担当する「Quality Runtime」の仕様を定義します。

## 構成と責務
Quality Runtime は、実行環境の変更（EventBus からの通知）を契機として起動し、ポリシーに基づいた品質評価を実行します。
1. **評価専用設計**: Quality Runtime は一切のアクション実行（ミュータブル処理）を行わず、評価・ポリシー判定・推奨の生成に専念します。
2. **Quality Score 算出**: Standard Quality Score モデルに基づき、0〜100 の範囲で評価スコアを算定します。
3. **Recommendation 生成**: 品質が定義されたしきい値を下回った場合、適合するアクションを含む `Recommendation` を生成し、`RecommendationGenerated` イベントを通じて Automation Runtime へ提案します。
