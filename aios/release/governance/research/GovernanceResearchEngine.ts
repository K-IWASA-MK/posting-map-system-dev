/**
 * GovernanceResearchEngine.ts
 * 
 * Deployment Target Verification Gate - Governance Research Engine (Sprint DTVG-15)
 * 自律研究パイプライン (パターン発見 -> 仮説生成 -> 検証 -> ナレッジ拡張提案) を統括実行する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../memory/DeploymentGovernanceMemoryRegistry';
import { RiskHypothesisGenerator } from './RiskHypothesisGenerator';
import { ResearchValidationEngine } from './ResearchValidationEngine';
import { GovernanceResearchRegistry } from './GovernanceResearchRegistry';
import {
  PatternDiscovery,
  ResearchFinding,
  KnowledgeExpansionProposal
} from './GovernanceResearchTypes';

export class GovernanceResearchEngine {
  private readonly hypothesisGenerator: RiskHypothesisGenerator;
  private readonly validationEngine: ResearchValidationEngine;

  constructor() {
    this.hypothesisGenerator = new RiskHypothesisGenerator();
    this.validationEngine = new ResearchValidationEngine();
  }

  /**
   * 自律ガバナンス研究パイプラインを統合実行する
   */
  public conductResearch(employeeId: string = 'emp-aios-deployer'): ResearchFinding {
    const memories = DeploymentGovernanceMemoryRegistry.queryMemories({ employeeId });
    const discoveries: PatternDiscovery[] = [];
    const now = new Date().toISOString();

    // 1. Discover Patterns from Memory Records
    const configFailures = memories.filter(m => m.gateFailedCount > 0);
    discoveries.push({
      discoveryId: `DISC-CFG-${Date.now()}`,
      category: 'RUNTIME_CONFIG',
      correlatedFactors: ['gasWebAppUrl', 'config.js', 'DeploymentID'],
      frequency: configFailures.length,
      confidenceScore: 88
    });

    discoveries.push({
      discoveryId: `DISC-ROOT-${Date.now()}`,
      category: 'PUBLISH_ROOT',
      correlatedFactors: ['targetPublishRoot', 'frontendConfigPath'],
      frequency: Math.max(1, memories.length),
      confidenceScore: 85
    });

    // 2. Generate Risk Hypotheses
    const hypotheses = this.hypothesisGenerator.generateHypotheses(discoveries);

    // 3. Validate Hypotheses against Past Data
    const validations = this.validationEngine.validateHypotheses(hypotheses, employeeId);

    // 4. Generate Knowledge Expansion Proposals for Validated Hypotheses
    const proposals: KnowledgeExpansionProposal[] = [];

    for (const val of validations) {
      if (val.validated) {
        const hyp = hypotheses.find(h => h.hypothesisId === val.hypothesisId);
        if (hyp) {
          proposals.push({
            proposalId: `PROP-EXP-${Date.now()}-${proposals.length + 1}`,
            hypothesisId: hyp.hypothesisId,
            proposedPatternName: hyp.title,
            preventionGuidance: hyp.suggestedCheck,
            expectedRiskReduction: `Estimated ${val.historicalMatchRate.toFixed(1)}% reduction in deployment failures.`,
            createdAt: now
          });
        }
      }
    }

    const findingId = `FIND-${employeeId}-${Date.now()}`;
    const finding: ResearchFinding = {
      findingId,
      employeeId,
      discoveries,
      hypotheses,
      validations,
      proposals,
      researchedAt: now
    };

    GovernanceResearchRegistry.saveFinding(finding);
    return finding;
  }
}
