export interface DecisionReason {
  readonly trigger: string;
  readonly supportingEvidence: string[];
  readonly affectedRuntime: string[];
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly confidence: number;
  readonly policyVersion: string;
  readonly predictionVersion: string;
}
