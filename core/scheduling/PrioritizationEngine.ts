import { SchedulingContext } from "./SchedulingContext";
import { ScheduleStrategy } from "./ScheduleStrategy";
import { SchedulingPolicy } from "./SchedulingPolicy";

export class PrioritizationEngine {
  public prioritize(queue: SchedulingContext[], strategy: ScheduleStrategy, policy: SchedulingPolicy): SchedulingContext[] {
    // Identity function for foundation
    return queue;
  }

  public detectPreemption(incomingContext: SchedulingContext, currentRunning: SchedulingContext[]): boolean {
    if (incomingContext.traceId === "CRITICAL") return true;
    return false;
  }
}
