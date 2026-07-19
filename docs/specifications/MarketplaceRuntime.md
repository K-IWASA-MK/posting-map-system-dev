# Marketplace Runtime 仕様書

## 概要
本仕様書は、プラットフォーム対応サービスの公開、検索、および運用品質レビューの集計を司る「Marketplace Runtime」の仕様を定義します。

## 構成と責務
1. **サービス公開 (Marketplace Registry)**:
   - 公開カタログエントリー `MarketplaceEntry`（entryId, serviceId, visibility, rating, status）を管理します。
2. **公開ポリシー審査 (Marketplace Policy)**:
   - 公開条件（カテゴリ存在、不当属性の排除）をクリアしたエントリーのみを公開可能（PUBLISHED）とします。
3. **レビュー評価と品質連携 (Marketplace Review Model)**:
   - レビュー情報 `MarketplaceReview`（reviewId, qualityScore, trustScore）を保持し、運用品質指標として Quality Runtime 等と連携します。
