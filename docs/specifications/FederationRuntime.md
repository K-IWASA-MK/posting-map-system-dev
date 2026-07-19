# Federation Runtime 仕様書

## 概要
本仕様書は、AIOS 実行インスタンスの外にある他ドメインおよびサービスとの接続、フェデレーションセッションの管理を行う「Federation Runtime」の仕様を定義します。

## 構成と責務
1. **ドメインプロファイル管理 (Federation Domain Profile)**:
   - 外部ドメインの接続特性を標準化した `FederationDomainProfile`（domainId, domainType [AIOS, CLOUD, SaaS, INTERNAL, PARTNER], protocol, trustLevel, supportedCapabilities[]）を管理します。
2. **接続セッション管理 (Federation Session Lifecycle)**:
   - セッションの明確な状態遷移（CREATED ➔ AUTHENTICATED ➔ ESTABLISHED ➔ SUSPENDED ➔ TERMINATED）を管理します。セッション失効時は関連するリモート信頼キャッシュを即時に破棄します。
3. **リモート ID 解決の中継**:
   - 外部ドメインと連携してリモートアイデンティティ問い合わせおよび証明書交換処理を統治します。
