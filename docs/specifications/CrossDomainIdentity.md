# Cross-Domain Identity Engine 仕様書

## 概要
本仕様書は、外部ドメインのアイデンティティ（RemoteIdentity）をローカルアイデンティティ空間のデジタル ID にマッピング・変換する「Cross-Domain Identity Engine」の仕様を定義します。

## 構成と責務
1. **アイデンティティマッピングポリシー (Identity Mapping Policy)**:
   - マッピングルールをポリシー定義 `IdentityMappingPolicy`（mappingType [1:1, AttributeBased, GroupBased, NamespaceTranslation], priority, conditions）として Governance Runtime から配布可能とします。
2. **名前空間変換 (Namespace Translation)**:
   - ドメインの識別衝突を防ぐため、外部 ID に対するドメインプレフィックス変換を行い、ローカル `IdentityRuntime` 内に検証用の暫定アカウントを自動生成します。
3. **リモート ID 解決サービス (Identity Resolver)**:
   - 外部認証情報をローカルセキュリティコンテキストで透過的に利用可能にするための解決 API を提供します。
