export interface ScheduleConstraint {
  readonly mustRunAfter: string[];
  readonly mustRunBefore: string[];
  readonly exclusive: boolean;
  readonly coLocateWith: string[];
  readonly antiAffinity: string[];
}
