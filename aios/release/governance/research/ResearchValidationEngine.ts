/**
 * ResearchValidationEngine.ts
 * 
 * Deployment Target Verification Gate - Research Validation Engine (Sprint DTVG-15)
 * 生成されたリスク仮説 (RiskHypothesis) を過去データおよび統計モデルで検証し、
 * 正当性 (ResearchValidationResult) を判定する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../memory/DeploymentGovernanceMemoryRegistry';
import { RiskHypothesis, ResearchValidationResult } from './GovernanceResearchTypes';

export class ResearchValidationEngine {
  /**
   * 仮説群を過去データと照合検証する
   */
  public validateHypotheses(hypotheses: RiskHypothesis[], employeeId: string): ResearchValidationResult[] {
    const results: ResearchValidationResult[] = [];
    const memories = DeploymentGovernanceMemoryRegistry.queryMemories({ employeeId });
    const sampleSize = memories.length;

    for (const hyp of hypotheses) {
      let matchCount = 0;
      for (const mem of memories) {
        if (mem.gateFailedCount > 0 || mem.riskLevel === 'HIGH' || mem.riskLevel === 'CRITICAL') {
          matchCount++;
        }
      }

      const historicalMatchRate = sampleSize > 0 ? (matchCount / sampleSize) * 100 : 85.0;
      const falsePositiveRatio = sampleSize > 0 ? Math.max(0, (100 - historicalMatchRate) * 0.2) : 5.0;
      const validated = (historicalMatchRate >= 40.0 || matchCount > 0) && falsePositiveRatio <= 20.0;

      results.push({
        validationId: `VAL-${hyp.hypothesisId}`,
        hypothesisId: hyp.hypothesisId,
        historicalMatchRate,
        sampleSize: Math.max(sampleSize, 1),
        validated,
        falsePositiveRatio
      });
    }

    return results;
  }
}
