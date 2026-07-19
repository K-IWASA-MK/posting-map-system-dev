# Resource Allocation (リソース配分仕様書)

## 概要
`ResourceAllocation` は、各アプリケーションや実行コンテキストに対して割り当てられる具体的な論理的・物理的リソースの割当量です。

## スキーマ定義
```typescript
interface ResourceAllocation {
  allocationId: string;
  cpu: number;        // CPU コア数またはシェア値
  memory: number;     // メモリ容量 (MB単位)
  gpu: number;        // GPU コア数または個数
  storage: number;    // ストレージ容量 (GB単位)
  network: number;    // 帯域制限値 (Mbps単位)
  placement: string;  // 割り当てられたノードまたは環境ID
}
```
