# Federation Architecture 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける連邦信頼（Federation）、ドメイン間 ID マッピング（Cross-Domain Identity Engine）、および外部信頼評価（Federation Trust Engine）の結合境界、データ伝播モデル、および正式なランタイム階層構造を規定します。

## フェデレーション・クロスドメインデータフロー (Federation Flow)

```
[Federation Runtime] (ドメイン接続・セッション管理)
         │
         ▼
[Cross-Domain Identity Engine] (ID 変換・マッピング解決)
         │
         ▼
[Federation Trust Engine] (ドメイン証明書交換 & クロスドメイン署名・信頼評価)
         │
         ▼ (Remote Identity / trustScore)
[Security Runtime] (認可判定時のリモートドメイン信頼閾値チェック)
```

## 統合セキュリティイベントフロー
連邦信託およびセッションに関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
DomainRegistered ➔ FederationSessionCreated ➔ IdentityMapped ➔ CertificateExchanged ➔ RemoteIdentityVerified ➔ RemoteTrustEvaluated ➔ FederationTrustUpdated ➔ FederationSessionTerminated
```

1. **DomainRegistered**: 外部信頼ドメイン情報およびプロファイルが登録された際に発行。
2. **FederationSessionCreated**: ドメイン間セッションのネゴシエーションが成功し、セッションオブジェクトが生成された際に発行。
3. **IdentityMapped**: 外部 ID からローカルの ID 空間へのマッピングと暫定 ID 生成が完了した際に発行。
4. **CertificateExchanged**: 外部証明書の検証鍵インポートが完了した際に発行。
5. **RemoteIdentityVerified**: リモートアイデンティティの署名・状態検証が正常クリアした際に発行。
6. **RemoteTrustEvaluator**: 外部ドメイン実績に基づく信頼評価スコアリングが実行された際に発行。
7. **FederationTrustUpdated**: 外部ドメインの信頼スコアがキャッシュ更新された際に発行。
8. **FederationSessionTerminated**: セッション終了または切断により、セッションが破棄され関連キャッシュが無効化された際に発行。

---

## AIOS Runtime アーキテクチャ階層 (正式構成)
Phase 10 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

```
Kernel
    ↓
Capability
    ↓
Runtime
    ↓
Runtime Service
    ↓
Governance Runtime
        ↓
Compliance Engine
    ↓
Federation Runtime
        ↓
Cross-Domain Identity Engine
        ↓
Federation Trust Engine
    ↓
Identity Runtime
        ↓
Trust Engine
        ↓
Certificate Registry
    ↓
Security Runtime
        ↓
Secret Broker
        ↓
Sandbox Manager
    ↓
Observability Runtime
    ↓
Quality Runtime
    ↓
Automation Runtime
    ↓
Execution Runtime
    ↓
Event Ledger
    ↓
Projection
    ↓
Console Runtime
    ↓
Plugin Runtime (Sandboxed)
```
本構成により、AIOS は単一インスタンスの限界を突破し、外部ドメイン、SaaS API、および他の AIOS インスタンスとの間で暗号学的検証が可能なアイデンティティおよび信頼関係の連邦（Federation）を維持しながら、安全に情報交換および連携実行を行うための統一的な分散信頼基盤を完成させます。
