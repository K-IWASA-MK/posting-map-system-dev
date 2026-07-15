import { RoutingPath } from "./RoutingPath";

export interface RoutingDecisionRecord {
  readonly id: string;
  readonly traceId: string;
  readonly selectedPath: RoutingPath;
  readonly isApproved: boolean;
  readonly reason: string;
  readonly executedAt: number;
}
