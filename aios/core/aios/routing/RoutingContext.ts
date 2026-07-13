import { EnvironmentVector } from "../optimization/EnvironmentVector";

export interface RoutingContext {
  readonly requestId: string;
  readonly executionId: string;
  readonly runtimeId: string;
  readonly trustScore: number;
  readonly governancePressure: number;
  readonly qualityScore: number;
  readonly requestedCapability: string;
  readonly priority: number;
  readonly deadline: number;
  readonly traceId: string;
  readonly environmentVector: EnvironmentVector;
}
