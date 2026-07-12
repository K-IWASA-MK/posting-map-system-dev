import { DevelopmentDecisionStatus } from './DevelopmentDecisionStatus';
import { DevelopmentAction } from './DevelopmentAction';
import { DevelopmentRecommendation } from './DevelopmentRecommendation';

export interface DevelopmentGovernanceDecision {
  readonly decisionId: string;
  readonly decisionVersion: string; // e.g. "v1", "v2"
  readonly status: DevelopmentDecisionStatus;
  readonly score: number; // 0 to 100
  readonly confidence: number; // 0.0 to 1.0
  readonly confidenceSource: string; // e.g. "Gemini", "Claude", "Consensus", "Human"
  readonly action: DevelopmentAction;
  readonly recommendations: readonly DevelopmentRecommendation[];
  readonly reason: string;
  readonly generatedAt: string;
}
