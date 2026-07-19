# Scaling Policy (スケーリングポリシー仕様書)

## 概要
`ScalingPolicy` は、実行リソースが動的にスケールアウト（拡張）またはスケールイン（縮小）する基準（閾値とクールダウン）を定義します。

## スキーマ定義
```typescript
interface ScalingPolicy {
  policyId: string;
  minReplicas: number;
  maxReplicas: number;
  cpuThreshold: number;       // CPU使用率の上限閾値 (%)
  memoryThreshold: number;    // メモリ使用率の上限閾値 (%)
  queueThreshold: number;     // キュー滞留数の上限閾値 (個数)
  cooldown: number;           // スケーリング判断後のクールダウン期間 (秒数)
}
```
