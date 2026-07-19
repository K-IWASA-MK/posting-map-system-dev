# Governance Architecture 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける統治（Governance）レイヤーの結合境界、データ伝播モデル、および正式なランタイム階層構造を規定します。

## ガバナンス・適合評価フロー (Governance Flow)

```
[Governance Runtime] (ポリシー管理・配信)
         │
         ▼ (PolicyActivated)
[Compliance Engine] (適合性監査)
         │
         ▼ (ComplianceEvaluated / overallScore)
[Quality Runtime] (Quality Score 内 'compliance' 項目へ反映)
```

## 統合ライフサイクルイベントフロー (Event Flow)
ガバナンスおよび適合性監査に関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
PolicyLoaded ➔ PolicyActivated ➔ ComplianceEvaluated ➔ ViolationDetected ➔ GovernanceDecision ➔ RecommendationGenerated
```

1. **PolicyLoaded**: 新規ポリシーバンドルが登録・検証された際に発行。
2. **PolicyActivated**: ポリシーバンドルがアクティブに有効化された際に発行。
3. **ComplianceEvaluated**: Compliance Engine が適合監査を終え、スコア算出とレポートをまとめた際に発行。
4. **ViolationDetected**: 適合監査で違反が発生した際に、その重要度と共に発行。
5. **GovernanceDecision**: 監査判定（PASS/FAIL）と判定理由（監査証跡）を記録した際に発行（元帳に蓄積）。
6. **RecommendationGenerated**: 適合性低下を検知し、Quality Runtime が是正推奨を発生させた際に発行。

---

## AIOS Runtime アーキテクチャ階層 (正式構成)
Phase 7 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

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
Plugin Runtime
```
実行されたアクション結果は Event Ledger にコミットされ、その結果を Projection 経由で Console Runtime が表示する流れが、プラットフォームの統治・観測・自律修復における基本データフローとなります。
