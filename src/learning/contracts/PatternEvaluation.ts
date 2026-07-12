/**
 * The evaluation metrics applied by the Learning Governance engine.
 */
export interface PatternEvaluation {
  readonly confidence: number;
  readonly qualityScore: number;
  readonly trustLevel: string;
  readonly approvedAt: Date;
}
