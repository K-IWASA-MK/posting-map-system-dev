# Placement Policy (配置ポリシー仕様書)

## 概要
`PlacementPolicy` は、サービスやワークフローを実行するノード（実行スレッド、プロセス、コンテナ等）の割り当てルールを定義します。

## 配置戦略 (Placement Strategy)
以下の4つの戦略を標準サポートします。
1. **SPREAD**: 負荷や障害耐性を高めるため、複数の物理/論理ノードへ分散して配置。
2. **BINPACK**: リソース密度を最大化し、稼働ノード数を最小限に抑えるように詰め込み配置。
3. **AFFINITY**: 指定されたサービスやノードと物理的・論理的に近接した場所に配置。
4. **ANTI_AFFINITY**: 同一種類のサービス同士が同じノードに配置されるのを回避（SPOFの排除）。

## スキーマ定義
```typescript
interface PlacementPolicy {
  policyId: string;
  strategy: 'SPREAD' | 'BINPACK' | 'AFFINITY' | 'ANTI_AFFINITY';
  affinity?: string[];
  antiAffinity?: string[];
  constraints?: Record<string, any>;
}
```
