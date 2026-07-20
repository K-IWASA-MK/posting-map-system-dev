export interface ThrottlePolicy {
  readonly policyId: string;
  readonly maxConcurrent: number;
}
