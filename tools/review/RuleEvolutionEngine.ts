import * as fs from 'fs';
import * as path from 'path';
import { RuleCandidate } from './RuleCandidate';
import { ArchitectureKnowledge } from './ArchitectureKnowledge';
import { ArchitecturePattern } from './ArchitecturePattern';

export class RuleEvolutionEngine {
  private static get candidatesDbPath(): string {
    return path.resolve(__dirname, 'rule_candidates.json');
  }

  public static loadCandidates(): RuleCandidate[] {
    if (!fs.existsSync(this.candidatesDbPath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.candidatesDbPath, 'utf-8'));
    } catch {
      return [];
    }
  }

  public static saveCandidates(candidates: RuleCandidate[]): void {
    try {
      fs.writeFileSync(this.candidatesDbPath, JSON.stringify(candidates, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[RuleEvolutionEngine] Failed to save candidates: ${err}`);
    }
  }

  /**
   * Generates new review rule candidates by analyzing knowledge and pattern bases.
   */
  public static generate(knowledges: ArchitectureKnowledge[], patterns: ArchitecturePattern[]): RuleCandidate[] {
    const candidates = this.loadCandidates();
    const generated: RuleCandidate[] = [];

    // Synthesize candidates from active patterns
    for (const p of patterns) {
      const candidateId = `EVOL-RULE-${p.id.replace('PATTERN-', '')}`;
      
      // Prevent duplicates
      if (candidates.some(c => c.id === candidateId)) {
        continue;
      }

      const candidate: RuleCandidate = {
        id: candidateId,
        title: `Auto-Evolved ${p.name}`,
        category: p.category,
        rationale: `Synthesized rule from Pattern: "${p.description}"`,
        triggerConditions: [...p.triggerConditions],
        confidence: p.confidence,
        status: 'CANDIDATE',
        createdAt: new Date().toISOString()
      };

      generated.push(candidate);
      candidates.push(candidate);
    }

    this.saveCandidates(candidates);
    return generated;
  }

  /**
   * Performs the Rule Constitution Check against AIOS Core Principles.
   * Prevents rules from breaking dev workspace, system, or vendor files.
   */
  public static checkConstitution(candidate: RuleCandidate): { pass: boolean; reason: string } {
    console.log(`[RuleEvolutionEngine] Auditing Rule Constitution compliance for candidate: "${candidate.id}"`);

    // Blocker: If a rule blocks all file escaping projects namespace indiscriminately
    if (candidate.triggerConditions.includes('project-escape') && candidate.triggerConditions.length === 1) {
      return {
        pass: false,
        reason: 'Rule Constitution Check Failed: Indiscriminate project-escape blocker is forbidden. It locks developer operations outside projects/ (e.g. tools/, sdk/).'
      };
    }

    // Blocker: Rules must not have 0 trigger conditions
    if (candidate.triggerConditions.length === 0) {
      return {
        pass: false,
        reason: 'Rule Constitution Check Failed: Review rule must specify at least one target trigger condition.'
      };
    }

    return {
      pass: true,
      reason: 'Rule candidate matches all constitution compliance parameters.'
    };
  }
}
