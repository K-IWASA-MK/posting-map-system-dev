export interface ResourceAllocation {
  readonly allocationId: string;
  readonly claimId: string;
  readonly allocatedCpu: number;
  readonly allocatedMemory: number;
  readonly allocatedTokens: number;
  readonly allocatedAt: number;
}
