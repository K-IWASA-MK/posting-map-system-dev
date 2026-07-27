/**
 * GovernanceImprovementRegistry.ts
 * 
 * Deployment Target Verification Gate - Improvement Registry (Sprint DTVG-14)
 * AI Employee 自律学習サイクルによって生成された改善提案および効果測定レコードを保存する。
 */

import { GovernanceImprovementProposal, LearningCycleResult } from './GovernanceImprovementTypes';

export class GovernanceImprovementRegistry {
  private static proposals: Map<string, GovernanceImprovementProposal> = new Map();
  private static cycleResults: LearningCycleResult[] = [];

  /**
   * 改善提案の保存
   */
  public static saveProposal(proposal: GovernanceImprovementProposal): void {
    this.proposals.set(proposal.proposalId, Object.freeze({ ...proposal }));
  }

  /**
   * 学習サイクル結果の保存
   */
  public static saveCycleResult(result: LearningCycleResult): void {
    this.cycleResults.push(Object.freeze({ ...result }));
  }

  /**
   * 全改善提案の取得
   */
  public static getAllProposals(): GovernanceImprovementProposal[] {
    return Array.from(this.proposals.values());
  }

  /**
   * 全学習サイクル結果の取得
   */
  public static getAllCycleResults(): LearningCycleResult[] {
    return [...this.cycleResults];
  }

  /**
   * レジストリのクリア (テスト用)
   */
  public static clear(): void {
    this.proposals.clear();
    this.cycleResults = [];
  }
}
