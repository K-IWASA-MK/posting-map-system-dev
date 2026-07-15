import { LearningPattern, PatternEvaluation, PatternStatus } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export class LearningPatternBuilder {
  public static buildApproved(
    discoveredPattern: LearningPattern,
    decision: GovernanceDecision,
    evaluation: PatternEvaluation
  ): LearningPattern {
    if (discoveredPattern.status !== PatternStatus.DISCOVERED) {
      throw new Error(`Cannot build APPROVED pattern from status ${discoveredPattern.status}. Must be DISCOVERED.`);
    }

    if (!decision.approved) {
      throw new Error("Cannot build APPROVED pattern with a REJECTED decision.");
    }

    // Determine new version. If DISCOVERED is version 0, APPROVED becomes version 1.
    const newVersion = discoveredPattern.version === 0 ? 1 : discoveredPattern.version + 1;

    return Object.freeze({
      schemaVersion: discoveredPattern.schemaVersion,
      patternId: discoveredPattern.patternId,
      version: newVersion,
      status: PatternStatus.APPROVED,
      createdAt: new Date().toISOString(), // Newly approved time
      sourceDatasetIds: [...discoveredPattern.sourceDatasetIds],
      patternType: discoveredPattern.patternType,
      patternData: { ...discoveredPattern.patternData },
      statistics: { ...discoveredPattern.statistics },
      evaluation: Object.freeze({ ...evaluation })
    });
  }
}
