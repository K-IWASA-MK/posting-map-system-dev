# Service Architecture 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおけるサービス流通、ライセンス検証、および課金管理の結合境界、データ伝播モデル、および正式なランタイム階層構造を規定します。

## サービス配信・ライセンス検証データフロー (Service Flow)

```
[Marketplace Runtime] (サービス公開審査 & カタログ検索)
         │
         ▼
[Service Runtime] (サービス依存解決・起動/停止ライフサイクル)
         │
         ▼
[License Runtime] (ライセンス発行・有効期限 & 状態遷移監査)
         │
         ▼
[Billing Runtime] (決済プロバイダー抽象呼び出し & トランザクション)
         │
         ▼ (License Validated)
[Security Runtime] (サービス実行認可時のライセンス判定フック)
```

## 統合セキュリティイベントフロー
サービスライフサイクルおよび決済に関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
ServiceRegistered ➔ ManifestVerified ➔ MarketplacePublished ➔ LicenseIssued ➔ LicenseValidated ➔ BillingAuthorized ➔ SubscriptionActivated ➔ ServiceStarted ➔ ServiceStopped
```

1. **ServiceRegistered**: サービスパッケージがローカルに仮登録された際に発行。
2. **ManifestVerified**: マニフェストの署名検証およびハッシュ照合が成功した際に発行。
3. **MarketplacePublished**: 審査を通過し Marketplace Catalog にサービスが一般掲載された際に発行。
4. **LicenseIssued**: サービス利用ライセンスが特定 licenseeId 宛てに発行された際に発行。
5. **LicenseValidated**: Security 認可フック等からライセンス状態の有効性（ACTIVE）が承認された際に発行。
6. **BillingAuthorized**: 決済プロバイダーを通じて利用料金の決済承認が完了した際に発行。
7. **SubscriptionActivated**: サブスクリプション状態がアクティブ化された際に発行。
8. **ServiceStarted**: すべての依存サービス解決後にサービスが起動実行された際に発行。
9. **ServiceStopped**: 手動停止、期間満了、またはヘルス違反による強制終了が行われた際に発行。

---

## AIOS Runtime アーキテクチャ階層 (正式構成)
Phase 11 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

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
Marketplace Runtime
        ↓
Service Runtime
        ↓
License Runtime
        ↓
Billing Runtime
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
本構成により、AIOS は安全な暗号学的 ID とフェデレーションセッションの上に、商業的な流通カタログ、ライセンス期間管理、および支払いトランザクションを完全に抽象化・自動化し、安全かつ堅牢なサービスプラットフォーム環境を提供します。
