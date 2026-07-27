/**
 * GovernanceResearchRegistry.ts
 * 
 * Deployment Target Verification Gate - Research Registry (Sprint DTVG-15)
 * AI Employee の自律研究活動で発見されたパターン・仮説・検証結果・ナレッジ拡張提案を保持する。
 */

import {
  ResearchFinding,
  KnowledgeExpansionProposal,
  RiskHypothesis
} from './GovernanceResearchTypes';

export class GovernanceResearchRegistry {
  private static findings: ResearchFinding[] = [];
  private static proposals: Map<string, KnowledgeExpansionProposal> = new Map();
  private static hypotheses: Map<string, RiskHypothesis> = new Map();

  /**
   * 研究成果全体 (ResearchFinding) の保存
   */
  public static saveFinding(finding: ResearchFinding): void {
    this.findings.push(Object.freeze({ ...finding }));
    for (const h of finding.hypotheses) {
      this.hypotheses.set(h.hypothesisId, Object.freeze({ ...h }));
    }
    for (const p of finding.proposals) {
      this.proposals.set(p.proposalId, Object.freeze({ ...p }));
    }
  }

  /**
   * ナレッジ拡張提案の保存
   */
  public static saveProposal(proposal: KnowledgeExpansionProposal): void {
    this.proposals.set(proposal.proposalId, Object.freeze({ ...proposal }));
  }

  /**
   * 全研究成果の取得
   */
  public static getAllFindings(): ResearchFinding[] {
    return [...this.findings];
  }

  /**
   * 全ナレッジ拡張提案の取得
   */
  public static getAllProposals(): KnowledgeExpansionProposal[] {
    return Array.from(this.proposals.values());
  }

  /**
   * 全仮説の取得
   */
  public static getAllHypotheses(): RiskHypothesis[] {
    return Array.from(this.hypotheses.values());
  }

  /**
   * レジストリのクリア (テスト用)
   */
  public static clear(): void {
    this.findings = [];
    this.proposals.clear();
    this.hypotheses.clear();
  }
}
