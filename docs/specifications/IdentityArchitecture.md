# Identity Architecture 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおけるデジタルアイデンティティ（Identity）、証明書レジストリ（Certificate Registry）、および信頼評価（Trust Engine）の結合境界、データ伝播モデル、および正式なランタイム階層構造を規定します。

## アイデンティティ・信頼評価データフロー (Trust Evaluation Flow)

```
[Identity Runtime] (アイデンティティ管理) ────► [Certificate Registry] (証明書ストア)
        │                                                  │
        ▼ (Identity ID / Verification)                    ▼ (Certificate VALID)
[Trust Engine] (電子署名検証 & Trust Score 算定) ◄─────────┘
        │
        ▼ (Trust Score & trustStatus)
[Security Runtime] (認可判定時の最低信頼閾値チェック)
```

## 統合セキュリティイベントフロー
アイデンティティおよび信頼基盤に関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
IdentityRegistered ➔ CertificateIssued ➔ SignatureVerified ➔ TrustEvidenceCollected ➔ TrustEvaluated ➔ TrustUpdated ➔ IdentityRevoked
```

1. **IdentityRegistered**: 主体が特定の名前空間に新しく登録された際に発行。
2. **CertificateIssued**: 公開鍵に紐付く検証可能な電子証明書がストアに発行された際に発行。
3. **SignatureVerified**: 送信された署名と公開鍵の決定論的照合が行われた際に発行。
4. **TrustEvidenceCollected**: 新たな実績証跡（署名検証成功/不適合履歴等）が収集された際に発行。
5. **TrustEvaluated**: `TrustEvaluator` が信頼スコアおよび検証状態を集計・更新した際に発行。
6. **TrustUpdated**: 算定された信頼スコアの最終変動が通知された際に発行。
7. **IdentityRevoked**: 侵害検出や無効化操作により、アイデンティティが即時失効された際に発行。

---

## AIOS Runtime アーキテクチャ階層 (正式構成)
Phase 9 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

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
本構成により、AIOS は実行主体が「誰であるか」を暗号学的に検証し、「どの程度信頼できるか」を継続評価した上で、安全に隔離実行（Sandbox）し、その事実を観測・評価・自動是正する自律統治プラットフォームの強固な土台を完成させます。
