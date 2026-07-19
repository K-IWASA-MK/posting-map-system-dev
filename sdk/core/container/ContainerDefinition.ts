export enum RuntimeClass {
  NATIVE = 'NATIVE',
  CONTAINER = 'CONTAINER',
  WASM = 'WASM',
  MICRO_VM = 'MICRO_VM'
}

export interface ResourceQuota {
  quotaId: string;
  cpuLimit: number;      // % CPU cores
  memoryLimit: number;   // MB memory limit
  gpuLimit: number;      // GPU allocation limit
  storageLimit: number;  // GB disk limit
  networkLimit: number;  // Mbps band limit
}

export interface ContainerMetadata {
  containerId: string;
  imageDigest: string;
  runtimeClass: RuntimeClass;
  createdAt: string;
  owner: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface ContainerDefinition {
  containerId: string;
  image: string;
  entrypoint: string[];
  environment: Record<string, string>;
  volumes: string[];
  network: string;
  resourceQuota: ResourceQuota;
  sandboxProfile: string;
  metadata?: ContainerMetadata;
}
