# Orchestration Plan (オーケストレーション実行計画仕様書)

## 概要
`OrchestrationPlan` は、アプリケーションまたは個別のワークフローがどのリソース上で、どのようにスケールし、どこに配置されるかを示す宣言的な実行計画書です。

## スキーマ定義
```typescript
interface OrchestrationPlan {
  planId: string;
  applicationId: string;
  workflowId?: string;
  placementPolicy: PlacementPolicy;
  resourceAllocation: ResourceAllocation;
  scalingPolicy: ScalingPolicy;
  status: 'PLANNING' | 'ACTIVE' | 'TERMINATED';
  createdAt: string;
}
```

### ステータス遷移
1. **PLANNING**: 計画策定中。
2. **ACTIVE**: 計画に基づきリソースが確保され、稼働中。
3. **TERMINATED**: 実行が終了または破棄された状態。
