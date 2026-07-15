import { ResourceAllocation } from "./ResourceAllocation";

export interface ResourceRecord {
  readonly id: string;
  readonly traceId: string;
  readonly allocation: ResourceAllocation;
  readonly recordedAt: number;
}
