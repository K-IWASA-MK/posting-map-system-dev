/**
 * GovernanceEvolutionEngine.ts
 * 
 * Deployment Target Verification Gate - Evolution Engine (Sprint DTVG-13)
 * 長期記憶の分析データに基づき、AI Employee の Governance Skill Level
 * および Confidence 補正値を自律計算し、進化スナップショット (EvolutionSnapshot) を生成する。
 */

import { GovernanceMemoryAnalyzer } from './GovernanceMemoryAnalyzer';
import { EvolutionSnapshot } from './DeploymentGovernanceMemoryTypes';

export class GovernanceEvolutionEngine {
  private readonly memoryAnalyzer: GovernanceMemoryAnalyzer;

  constructor() {
    this.memoryAnalyzer = new GovernanceMemoryAnalyzer();
  }

  /**
   * 指定した AI Employee の長期記憶から進化スナップショットを計算・生成する
   */
  public generateSnapshot(employeeId: string = 'emp-aios-deployer'): EvolutionSnapshot {
    const exp = this.memoryAnalyzer.analyzeExperience(employeeId);

    let governanceSkillLevel: 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER' = 'NOVICE';
    let confidenceAdjustment = 0;
    const evolutionInsights: string[] = [];

    if (exp.totalMemories >= 20 && exp.successfulOutcomeRate >= 95) {
      governanceSkillLevel = 'MASTER';
      confidenceAdjustment = 0.05;
      evolutionInsights.push('Achieved Master Level: High historical deployment success rate with zero critical failures.');
    } else if (exp.totalMemories >= 10 && exp.successfulOutcomeRate >= 90) {
      governanceSkillLevel = 'ADVANCED';
      confidenceAdjustment = 0.03;
      evolutionInsights.push('Achieved Advanced Level: Demonstrated strong prevention of stale config and publish root mismatches.');
    } else if (exp.totalMemories >= 3 && exp.successfulOutcomeRate >= 80) {
      governanceSkillLevel = 'INTERMEDIATE';
      confidenceAdjustment = 0.01;
      evolutionInsights.push('Achieved Intermediate Level: Active pattern learning from ExecutionLedger records.');
    } else {
      governanceSkillLevel = 'NOVICE';
      confidenceAdjustment = 0.00;
      evolutionInsights.push('Novice Level: Initial governance memory accumulation in progress.');
    }

    if (exp.falsePositiveRate > 15) {
      confidenceAdjustment -= 0.02;
      evolutionInsights.push(`False Positive Notice: High false positive rate (${exp.falsePositiveRate.toFixed(1)}%). Recommend refining Gate-004 thresholds.`);
    }

    const snapshotId = `EVO-${employeeId}-${Date.now()}`;
    const createdAt = new Date().toISOString();

    return {
      snapshotId,
      employeeId,
      governanceSkillLevel,
      confidenceAdjustment,
      evolutionInsights,
      createdAt
    };
  }
}
