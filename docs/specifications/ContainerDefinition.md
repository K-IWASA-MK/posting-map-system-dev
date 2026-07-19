# Container Definition (コンテナ定義仕様書)

## 概要
`ContainerDefinition` は、プロセスを起動するコンテナイメージ名、実行エントリポイント、環境変数、ボリューム、ネットワーク境界、リソース割り当て、およびセキュリティプロファイルで構成される定義情報です。

## スキーマ定義
```typescript
interface ContainerDefinition {
  containerId: string;
  image: string;
  entrypoint: string[];
  environment: Record<string, string>;
  volumes: string[];
  network: string;
  resourceQuota: ResourceQuota;
  sandboxProfile: string;
}

interface ContainerMetadata {
  containerId: string;
  imageDigest: string;
  runtimeClass: 'NATIVE' | 'CONTAINER' | 'WASM' | 'MICRO_VM';
  createdAt: string;
  owner: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}
```
