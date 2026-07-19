# Execution Queue (実行キュー仕様書)

## 概要
`ExecutionQueue` は、ワークフローやタスクの実行要求を受け付け、優先度（Priority）やスケジューリングポリシー（SchedulingPolicy）に基づいて順番を制御するバッファ層です。

## キューアイテム定義 (ExecutionQueueItem)
```typescript
interface ExecutionQueueItem {
  queueId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  workflowId: string;
  applicationId: string;
  requestedResources: ResourceAllocation;
  deadline?: string;         // 期待完了期限 (ISO8601フォーマット)
  retryCount: number;        // 再試行回数
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
```

## スケジューリングポリシー (SchedulingPolicy)
キューの処理は以下の戦略に従ってディスパッチされます。
- **FIFO**: 最初に入ったタスクから順番に実行（先入先出）。
- **PRIORITY**: `priority` の高いタスク（`CRITICAL` -> `HIGH` -> `MEDIUM` -> `LOW`）を優先して実行。
- **DEADLINE**: `deadline`（期限）の最も迫っているタスクを優先して実行。
- **FAIR_SHARE**: 各アプリケーション/ユーザーに公平にリソースを配分。
- **ROUND_ROBIN**: アプリケーション間でラウンドロビン方式で均等に割り当て。
