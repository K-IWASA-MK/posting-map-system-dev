export interface PlanStep {
  stepId: string;
  action: string;
  target: string;
  preconditions: string[];
  postconditions: string[];
  priority: string;
}
