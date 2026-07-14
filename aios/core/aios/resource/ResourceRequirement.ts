export interface ResourceRequirement {
  readonly requirementId: string;
  readonly traceId: string;
  readonly estimatedCpuMs: number;
  readonly estimatedMemoryMb: number;
  readonly requiredTokens: number;
  readonly maxCostLimit: number;
}
