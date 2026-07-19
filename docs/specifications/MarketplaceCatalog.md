# Marketplace Catalog 仕様書

## 概要
本仕様書は、SaaS 接続用およびサードパーティ製のサービスが Marketplace に掲載される際のカタログ情報モデルを定義します。

## 掲載モデル (MarketplaceEntry)
- **entryId**: カタログ掲載一意ID
- **serviceId**: 対象サービスID
- **publisherId**: 公開元事業者ID
- **visibility**: 公開範囲設定（PUBLIC / PRIVATE）
- **category**: 分類カテゴリ
- **rating**: 平均品質レビュー値
- **status**: 掲載状態（PUBLISHED / UNPUBLISHED）

## 評価情報の連動 (Marketplace Review)
- カタログは各エージェント・管理者から寄せられた `MarketplaceReview` を集約し、自動的に rating レーティングを再計算します。
