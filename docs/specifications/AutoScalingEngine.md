# Auto-Scaling Engine (自動スケーリングエンジン仕様書)

## 概要
`AutoScalingEngine` は、システムメトリクスとキュー深度をリアルタイムに監視し、登録された `ScalingPolicy` に基づいて動的なリソースのスケールアウト/スケールインを決定します。

## スケーリング決定理由 (ScalingDecisionReason)
すべての決定には、監査および分析を可能にするため以下の明確な理由が付与されます。
- **CPU_THRESHOLD**: CPU使用率がポリシーで規定された閾値を超過/下回ったため。
- **MEMORY_THRESHOLD**: メモリ使用率がポリシーで規定された閾値を超過/下回ったため。
- **GPU_THRESHOLD**: GPU使用率がポリシーで規定された閾値を超過/下回ったため。
- **QUEUE_DEPTH**: 実行キューに溜まっている未処理タスク数が閾値を超過/下回ったため。
- **MANUAL_REQUEST**: 管理者による手動のスケーリング指示によるもの。
- **RECOVERY**: 障害回復処理（自己修復プロセス）の一環としてスケーリングを実行したため。

## コンポーネント構成
1. **ResourceMonitor**: CPU、メモリ、GPUなどの物理リソース状況を監視。
2. **QueueMonitor**: `ExecutionQueue` のタスク処理状態（深さや待機時間）を監視。
3. **ScalingDecisionManager**: スケール決定を不変記録し、監査用に追跡。
