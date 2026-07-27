/**
 * GovernanceLearningEngine.ts
 * 
 * Deployment Target Verification Gate - Self Learning Engine (Sprint DTVG-14)
 * 長期記憶 (Governance Memory) および進化スナップショットを解析し、
 * 判断品質 (Decision Quality) 評価、Confidence 最適化、および改善提案を自動生成する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../memory/DeploymentGovernanceMemoryRegistry';
import { GovernanceExperience } from '../memory/DeploymentGovernanceMemoryTypes';
import { GovernanceMemoryAnalyzer } from '../memory/GovernanceMemoryAnalyzer';
import { GovernanceConfidenceOptimizer } from './GovernanceConfidenceOptimizer';
import { GovernanceImprovementRegistry } from './GovernanceImprovementRegistry';
import {
  DecisionQualityScore,
  GovernanceImprovementProposal,
  LearningCycleResult
} from './GovernanceImprovementTypes';

export class GovernanceLearningEngine {
  private readonly memoryAnalyzer: GovernanceMemoryAnalyzer;
  private readonly confidenceOptimizer: GovernanceConfidenceOptimizer;

  constructor() {
    this.memoryAnalyzer = new GovernanceMemoryAnalyzer();
    this.confidenceOptimizer = new GovernanceConfidenceOptimizer();
  }

  /**
   * AI Employee のガバナンス自律自己改善学習サイクルを実行する
   */
  public runLearningCycle(employeeId: string = 'emp-aios-deployer'): LearningCycleResult {
    const experience = this.memoryAnalyzer.analyzeExperience(employeeId);
    const memories = DeploymentGovernanceMemoryRegistry.queryMemories({ employeeId });

    // 1. Decision Quality Score 算出
    const totalEvaluations = memories.length;
    let correctDecisions = 0;

    for (const mem of memories) {
      if (mem.finalOutcome === 'SUCCESS' && mem.decision === 'ALLOW') {
        correctDecisions++;
      } else if (mem.finalOutcome === 'BLOCKED' && (mem.decision === 'DENY' || mem.decision === 'REQUIRE_REVIEW')) {
        correctDecisions++;
      } else if (mem.humanReviewResult === 'APPROVED') {
        correctDecisions++;
      }
    }

    const accuracyRate = totalEvaluations > 0 ? (correctDecisions / totalEvaluations) * 100 : 100;
    const falsePositiveRate = experience.falsePositiveRate;
    const falseNegativeRate = totalEvaluations > 0 ? Math.max(0, 100 - accuracyRate - falsePositiveRate) : 0;

    let qualityGrade: 'A' | 'B' | 'C' | 'D' = 'A';
    if (accuracyRate >= 95) qualityGrade = 'A';
    else if (accuracyRate >= 85) qualityGrade = 'B';
    else if (accuracyRate >= 70) qualityGrade = 'C';
    else qualityGrade = 'D';

    const qualityScore: DecisionQualityScore = {
      totalEvaluations,
      correctDecisions,
      accuracyRate,
      falsePositiveRate,
      falseNegativeRate,
      qualityGrade
    };

    // 2. Confidence Optimization 算出
    const confidenceOpt = this.confidenceOptimizer.optimizeConfidence(
      employeeId,
      95.0, // 基本 Confidence 95.0%
      qualityScore
    );

    // 3. Governance Improvement Proposals の動的生成
    const proposals: GovernanceImprovementProposal[] = [];
    const now = new Date().toISOString();

    if (qualityScore.falsePositiveRate > 10) {
      const prop: GovernanceImprovementProposal = {
        proposalId: `PROP-FP-${Date.now()}`,
        employeeId,
        title: 'Refine Gate-004 Config Match False Positive Thresholds',
        targetArea: 'Gate-004 Runtime Config Match',
        proposedAdjustment: 'Adjust endpoint matching strictness for staging URLs.',
        expectedImpact: 'Reduces false positive reviews by 15%.',
        applied: true,
        createdAt: now
      };
      proposals.push(prop);
      GovernanceImprovementRegistry.saveProposal(prop);
    }

    if (qualityScore.accuracyRate >= 90) {
      const prop: GovernanceImprovementProposal = {
        proposalId: `PROP-ACC-${Date.now()}`,
        employeeId,
        title: 'Auto-Promote High Accuracy Deployments',
        targetArea: 'Approval Intelligence Policy',
        proposedAdjustment: 'Increase baseline Confidence score for low risk production releases.',
        expectedImpact: 'Speeds up release approval workflow.',
        applied: true,
        createdAt: now
      };
      proposals.push(prop);
      GovernanceImprovementRegistry.saveProposal(prop);
    }

    const cycleId = `CYCLE-${employeeId}-${Date.now()}`;
    const result: LearningCycleResult = {
      cycleId,
      employeeId,
      qualityScore,
      confidenceOptimization: confidenceOpt,
      proposals,
      cycleCompletedAt: now
    };

    GovernanceImprovementRegistry.saveCycleResult(result);
    return result;
  }
}
