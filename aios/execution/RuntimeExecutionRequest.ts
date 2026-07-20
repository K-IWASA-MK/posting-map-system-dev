import { ScheduleResult } from "../runtime/ScheduleResult";

export interface RuntimeExecutionRequest {
  readonly schedule: ScheduleResult;
}
