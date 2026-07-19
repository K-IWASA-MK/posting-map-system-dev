# Resource Quota (リソース制限枠仕様書)

## 概要
`ResourceQuota` は、コンテナが使用できるCPU、メモリ、GPU、ストレージ、およびネットワークの物理的・論理的上限値です。

## スキーマ定義
```typescript
interface ResourceQuota {
  quotaId: string;
  cpuLimit: number;      // CPU使用率上限 (%)
  memoryLimit: number;   // メモリ容量上限 (MB)
  gpuLimit: number;      // GPU コア/枚数上限
  storageLimit: number;  // ストレージ容量上限 (GB)
  networkLimit: number;  // ネットワーク帯域上限 (Mbps)
}
```
`ContainerSupervisor` は実稼働中にこの制限値を監視し、閾値を超過した場合はプロセス終了（OOMやCPUスロットル等）などの適切なアクションをとります。
