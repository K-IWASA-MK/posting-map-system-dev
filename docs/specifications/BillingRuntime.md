# Billing Runtime 仕様書

## 概要
本仕様書は、サービス契約の料金請求、決済の実行、およびトランザクション履歴の記録を司る「Billing Runtime」の仕様を定義します。

## 決済プロバイダー抽象化 (Billing Provider Registry)
- **依存の排除**: Stripe などの具体的な決済 API に直接依存せず、抽象的なプロバイダーインターフェース（IBillingProvider）を定義します。
- **プロバイダー登録簿 (BillingProviderRegistry)**:
  - `providerId`: プロバイダー識別ID
  - `providerType`: 決済タイプ（CREDIT_CARD, BANK_TRANSFER, CRYPTO 等）
  - `status`: プロバイダーの状態（ACTIVE / INACTIVE）
  - `supportedFeatures`: サポート機能リスト
- **トランザクション記録 (BillingTransaction)**:
  - トランザクション ID、サービス ID、プロバイダー ID、請求金額、および決済結果状態（PAID / FAILED）を不変管理します。
