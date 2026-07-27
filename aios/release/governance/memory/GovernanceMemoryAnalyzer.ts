/**
 * GovernanceMemoryAnalyzer.ts
 * 
 * Deployment Target Verification Gate - Memory Analyzer (Sprint DTVG-13)
 * 長期記憶レジストリから過去の評価傾向・判定正確性・繰り返し失敗パターンを分析・集計する。
 */

import { DeploymentGovernanceMemoryRegistry } from './DeploymentGovernanceMemoryRegistry';
import { GovernanceExperience, GovernancePattern } from './DeploymentGovernanceMemoryTypes';
import { DeploymentKnowledgeRegistry } from '../../feedback/DeploymentKnowledgeRegistry';

export class GovernanceMemoryAnalyzer {

  /**
   * 指定した AI Employee のガバナンス経験・成功傾向を長期記憶から分析する
   */
  public analyzeExperience(employeeId: string = 'emp-aios-deployer'): GovernanceExperience {
    DeploymentKnowledgeRegistry.initializeDefaults();

    const memories = DeploymentGovernanceMemoryRegistry.queryMemories({ employeeId });
    const totalMemories = memories.length;

    let successCount = 0;
    let falsePositives = 0;

    for (const mem of memories) {
      if (mem.finalOutcome === 'SUCCESS') {
        successCount++;
      }
      if (mem.decision === 'DENY' && mem.humanReviewResult === 'OVERRIDDEN') {
        falsePositives++;
      }
    }

    const successfulOutcomeRate = totalMemories > 0 ? (successCount / totalMemories) * 100 : 100;
    const falsePositiveRate = totalMemories > 0 ? (falsePositives / totalMemories) * 100 : 0;

    // 定義済み標準事故パターンの読み込み
    const basePatterns = DeploymentKnowledgeRegistry.getAllPatterns();
    const learnedPatterns: GovernancePattern[] = basePatterns.map(p => ({
      patternId: p.patternId,
      patternName: p.name,
      category: p.category,
      frequency: memories.filter(m => m.gateFailedCount > 0).length,
      impactScore: p.category.includes('CONFIG') || p.category.includes('ROOT') ? 90 : 70,
      preventionStrategy: p.prevention
    }));

    return {
      employeeId,
      totalMemories,
      successfulOutcomeRate,
      falsePositiveRate,
      learnedPatterns
    };
  }
}
