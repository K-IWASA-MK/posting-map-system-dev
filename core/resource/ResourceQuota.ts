export interface ResourceQuota {
  readonly runtimeQuota: number;
  readonly agentQuota: number;
  readonly sessionQuota: number;
}
