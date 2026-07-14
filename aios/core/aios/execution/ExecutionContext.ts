export interface ExecutionContext {
  readonly traceId: string;
  readonly ticketId: string;
  readonly policyContext: any;
  readonly routingContext: any;
  readonly resourceContext: any;
  readonly schedulingContext: any;
}
