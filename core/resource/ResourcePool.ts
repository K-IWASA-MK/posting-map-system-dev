export interface ResourcePool {
  readonly cpuTotal: number;
  readonly memoryTotal: number;
  readonly gpuTotal: number;
  readonly networkTotal: number;
  readonly storageTotal: number;
  readonly tokenTotal: number;
  readonly costTotal: number;
}
