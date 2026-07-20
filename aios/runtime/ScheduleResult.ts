export interface ScheduleResult {
  readonly requestId: string;
  readonly scheduled: boolean;
  readonly retryPolicyId: string;
  readonly throttlePolicyId: string;
}
