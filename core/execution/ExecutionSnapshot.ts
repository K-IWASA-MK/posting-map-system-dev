export interface ExecutionSnapshot {
  readonly snapshotId: string;
  readonly timestamp: number;
  readonly sessionData: any;
  readonly ticketData: any;
  readonly resourceData: any;
  readonly schedulerData: any;
  readonly policyData: any;
  readonly routingData: any;
}
