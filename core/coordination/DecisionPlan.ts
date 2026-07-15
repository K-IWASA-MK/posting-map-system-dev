export interface DecisionPlan {
  readonly planId: string;
  readonly targetAction: string;
  readonly expectedOutcome: string;
  readonly requiredResources: any;
  readonly steps: string[];
}
