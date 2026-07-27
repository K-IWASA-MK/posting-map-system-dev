export interface DecisionReason {
  readonly factor: "EXPLICIT_MENTION" | "HISTORICAL_CONTEXT" | "CAPABILITY_MATCH" | "KEYWORD_MATCH";
  readonly value: string;
  readonly reason?: string;
  readonly score: number;
}

export interface IntentConfidence {
  readonly semanticConfidence: number;
  readonly projectMatchConfidence: number;
  readonly capabilityMatchConfidence: number;
  readonly historicalConfidence: number;
  readonly overallConfidence: number;
}

export interface ProjectCandidate {
  readonly projectId: string;
  readonly matchedCapabilities: readonly string[];
  readonly score: number;
}

export type TaskRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IntentDecision {
  readonly rawInput: string;
  readonly projectCandidates: readonly ProjectCandidate[];
  readonly selectedProjectId?: string;
  readonly requiredCapabilities: readonly string[];
  readonly confidence: IntentConfidence;
  readonly reasoning: readonly DecisionReason[];
  readonly riskLevel: TaskRiskLevel;
  readonly resolutionStatus: "RESOLVED" | "AMBIGUOUS" | "NEED_CLARIFICATION";
}

export interface ClarificationRequest {
  readonly clarificationId: string;
  readonly taskDraftId: string;
  readonly reason: "PROJECT_AMBIGUITY" | "LOW_CONFIDENCE" | "HIGH_RISK";
  readonly question: string;
  readonly candidates: readonly ProjectCandidate[];
  readonly confidence: number;
  readonly reasoning: readonly DecisionReason[];
  readonly riskLevel: TaskRiskLevel;
  readonly expiresAt: number;
}
