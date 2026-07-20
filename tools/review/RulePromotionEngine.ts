import * as fs from 'fs';
import * as path from 'path';
import { RuleCandidate, RuleProvenance } from './RuleCandidate';
import { RuleEvolutionEngine } from './RuleEvolutionEngine';

export class RulePromotionEngine {
  private static get promotedDbPath(): string {
    return path.resolve(__dirname, 'promoted_rules.json');
  }

  public static loadPromotedRules(): any[] {
    if (!fs.existsSync(this.promotedDbPath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.promotedDbPath, 'utf-8'));
    } catch {
      return [];
    }
  }

  public static savePromotedRules(rules: any[]): void {
    try {
      fs.writeFileSync(this.promotedDbPath, JSON.stringify(rules, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[RulePromotionEngine] Failed to save promoted rules: ${err}`);
    }
  }

  /**
   * Promotes a rule candidate to active promoted_rules.json status if it satisfies all quality criteria:
   * 1. Simulation runs PASS (no False Positives)
   * 2. AI Consensus Board votes PASS (decision: PROCEED)
   * 3. Rule Constitution audit PASS
   * 4. Evolution Confidence >= 0.95
   */
  public static promote(
    candidate: RuleCandidate,
    simulationPass: boolean,
    consensusDecision: 'PROCEED' | 'REJECT',
    derivedKnowledge: string[],
    derivedPatterns: string[],
    consensusSessionId: string,
    simulationRunId: string
  ): boolean {
    console.log(`[RulePromotionEngine] Evaluating promotion criteria for rule candidate: "${candidate.id}"`);

    // 1. Constitution Compliance Check
    const { ConstitutionComplianceEngine } = require('./ConstitutionComplianceEngine');
    const compliance = ConstitutionComplianceEngine.validate('RULE', candidate);
    if (!compliance.pass) {
      console.error(`[RulePromotionEngine] Promotion REJECTED: Candidate failed Constitution Compliance checks.`);
      this.updateCandidateStatus(candidate.id, 'REJECTED');
      return false;
    }

    // 2. Simulation Check
    if (!simulationPass) {
      console.error(`[RulePromotionEngine] Promotion REJECTED: Rule failed False Positive simulation checks.`);
      this.updateCandidateStatus(candidate.id, 'REJECTED');
      return false;
    }

    // 3. Consensus Check
    if (consensusDecision !== 'PROCEED') {
      console.error(`[RulePromotionEngine] Promotion REJECTED: AI Consensus Board rejected this rule.`);
      this.updateCandidateStatus(candidate.id, 'REJECTED');
      return false;
    }

    // 4. Confidence Threshold Check
    if (candidate.confidence < 0.95) {
      console.error(`[RulePromotionEngine] Promotion REJECTED: Confidence (${candidate.confidence}) is below threshold 0.95.`);
      this.updateCandidateStatus(candidate.id, 'REJECTED');
      return false;
    }

    // Criteria satisfied -> Promote!
    const promotedRules = this.loadPromotedRules();
    const provenance: RuleProvenance = {
      derivedFromKnowledge: derivedKnowledge,
      derivedFromPatterns: derivedPatterns,
      simulationRunId,
      consensusSessionId,
      promotedAt: new Date().toISOString()
    };

    const promotedRule = {
      id: candidate.id,
      title: candidate.title,
      category: candidate.category,
      rationale: candidate.rationale,
      triggerConditions: candidate.triggerConditions,
      provenance
    };

    // Prevent duplicates in active database
    const idx = promotedRules.findIndex(r => r.id === candidate.id);
    if (idx !== -1) {
      promotedRules[idx] = promotedRule;
    } else {
      promotedRules.push(promotedRule);
    }

    this.savePromotedRules(promotedRules);
    this.updateCandidateStatus(candidate.id, 'PROMOTED', provenance);

    console.log(`[RulePromotionEngine] SUCCESS: Candidate rule "${candidate.id}" has been PROMOTED to active rules registry.`);
    return true;
  }

  private static updateCandidateStatus(candidateId: string, status: RuleCandidate['status'], provenance?: RuleProvenance): void {
    const candidates = RuleEvolutionEngine.loadCandidates();
    const idx = candidates.findIndex(c => c.id === candidateId);
    if (idx !== -1) {
      candidates[idx] = {
        ...candidates[idx],
        status,
        provenance: provenance || candidates[idx].provenance
      };
      RuleEvolutionEngine.saveCandidates(candidates);
    }
  }
}
