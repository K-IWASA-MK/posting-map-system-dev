import { PolicyContext } from "./PolicyContext";

export interface ContextAggregator {
  aggregate(traceId: string): Promise<PolicyContext>;
}
