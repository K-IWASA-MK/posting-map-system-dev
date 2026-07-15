import { CoordinationContext } from "./CoordinationContext";

export interface ContextAggregator {
  aggregate(traceId: string): Promise<CoordinationContext>;
}
