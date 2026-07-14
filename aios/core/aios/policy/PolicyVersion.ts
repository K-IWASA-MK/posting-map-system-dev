export interface PolicyVersion {
  readonly policyId: string;
  readonly version: string;
  readonly revision: number;
  readonly parentVersion?: string;
  readonly generatedFrom: string;
  readonly approvedBy: string;
  readonly createdAt: number;
}
