export interface CoordinationContext {
  readonly traceId: string;
  readonly environmentVector: any; // Assuming EnvironmentVector type is loosely checked in foundation
  readonly optimizationState: string;
  readonly routingState: string;
  readonly predictiveState: string;
  readonly policyState: string;
  readonly timestamp: number;
}
