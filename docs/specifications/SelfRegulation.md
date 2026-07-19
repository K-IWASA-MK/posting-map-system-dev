# Self-Regulation 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける自己規制（Self-Regulation）閉ループの全容および実行結果の伝播アーキテクチャを規定します。

## 制御ループの流れ (Self-Regulation Loop)

```
[Observability Runtime] ➔ (TelemetryCollected)
         ▲
         │ (LedgerRecorded via EventBus)
         │
[Event Ledger]
         ▲
         │ (Commit)
         │
[Execution Runtime] ➔ (AutomationExecuted)
         ▲
         │ (Action)
         │
[Automation Runtime] ➔ (AutomationApproved)
         ▲
         │ (Recommendation)
         │
[Quality Runtime] ➔ (QualityEvaluated)
```

1. **TelemetryCollected**: テレメトリデータ（Logs, Metrics, Health, Traces）が Observability に収集されます。
2. **QualityEvaluated**: Quality Runtime が Observability Projection を評価し品質スコアを判定します。
3. **RecommendationGenerated**: しきい値違反を検出した際、Quality Runtime が修復 Recommendation を発行します。
4. **AutomationApproved**: Automation Runtime が安全ガード（Cooldown, Retry等）を適用して実行可否を承認判断します。
5. **AutomationExecuted / Completed**: 承認されたアクションが Execution Runtime で実行されます。
6. **LedgerRecorded**: 実行結果が Event Ledger に書き込まれ、不変トランザクション履歴として残ります。
7. **再観測 (Re-observation)**: 元帳コミットイベントが EventBus を介して Observability に再度収集され、次の評価のインプットになります。

---

## AIOS Runtime アーキテクチャ階層
Phase 6 完了後の正式なプラットフォーム実行階層モデルは以下の通り定義されます。

```
Kernel
    ↓
Capability
    ↓
Runtime
    ↓
Runtime Service
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

実行結果は Event Ledger に記録され、その結果を Projection 経由で Console Runtime が表示する流れが正式なプラットフォームアーキテクチャとなります。
