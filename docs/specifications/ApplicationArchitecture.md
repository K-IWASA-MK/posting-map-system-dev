# Application Architecture 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける構成的アプリケーション（Composable Application）、有向非巡回ワークフロー（Workflow Graph）、およびプロビジョニング制御の結合境界、データ伝播モデル、および正式なランタイム階層構造を規定します。

## アプリケーション配備・実行データフロー (Application Flow)

```
[Application Runtime] (プロビジョニング計画 & 構成検証)
         │
         ▼
[Workflow Runtime] (DAG トポロジーソート & 順次ノード・チェックポイント実行)
         │
         ▼
[Service Runtime] (サービス依存解決・実行)
         │
         ▼ (Application / Workflow Execution)
[Security Runtime] (実行前の承認ポリシー & ライセンス監査)
```

## 統合セキュリティイベントフロー
アプリ配備およびワークフローに関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
WorkflowRegistered ➔ WorkflowValidated ➔ ApplicationRegistered ➔ ProvisioningPlanned ➔ ProvisioningValidated ➔ ProvisioningCompleted ➔ WorkflowStarted ➔ WorkflowCompleted ➔ ApplicationActivated
```

1. **WorkflowRegistered**: ワークフロー定義がプラットフォームに登録された際に発行。
2. **WorkflowValidated**: グラフの DAG 検証、循環/孤立チェックが完全に成功した際に発行。
3. **ApplicationRegistered**: アプリケーション登録（署名ハッシュ照合成功）された際に発行。
4. **ProvisioningPlanned**: アプリ要件をベースに、依存サービスを検証する配備計画が起票された際に発行。
5. **ProvisioningValidated**: 必要な全サービス存在と環境設定が適合していると承認された際に発行。
6. **ProvisioningCompleted**: リソースバインド完了および配備計画のクローズ完了時に発行。
7. **WorkflowStarted**: アプリケーション内のワークフローがトポロジカル順に従って実行を開始した際に発行。
8. **WorkflowCompleted**: 全ワークフローノードの処理（チェックポイント記録）が完了した際に発行。
9. **ApplicationActivated**: アプリケーションインスタンスが正式にアクティブ（Activated）化された際に発行。

---

## AIOS Runtime アーキテクチャ階層 (正式構成)
Phase 12 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

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
Application Runtime (アプリケーション配備・管理)
        ↓
  Workflow Runtime (グラフワークフロー実行)
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
本構成により、AIOS は安全なセキュリティおよび流通ライセンス基盤の上に、複数の独立したサービスを組み合わせ、閉路のない安全な有向非巡回グラフとして連鎖実行する、極めて柔軟で再利用性の高い分散アプリケーションプラットフォーム環境を構築します。
