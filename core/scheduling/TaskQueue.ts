import { SchedulingContext } from "./SchedulingContext";
import { ScheduleStrategy } from "./ScheduleStrategy";

export interface TaskQueue {
  enqueue(context: SchedulingContext): void;
  dequeue(): SchedulingContext | null;
  peek(): SchedulingContext | null;
  getStrategy(): ScheduleStrategy;
  getSize(): number;
}
