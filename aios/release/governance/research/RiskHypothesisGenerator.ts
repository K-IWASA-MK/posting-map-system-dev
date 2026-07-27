/**
 * RiskHypothesisGenerator.ts
 * 
 * Deployment Target Verification Gate - Risk Hypothesis Generator (Sprint DTVG-15)
 * デプロイ履歴・事故パターンから未定義のリスク仮説 (RiskHypothesis) を自律生成する。
 */

import { PatternDiscovery, RiskHypothesis } from './GovernanceResearchTypes';

export class RiskHypothesisGenerator {
  /**
   * 発見されたパターン群からリスク仮説を生成する
   */
  public generateHypotheses(discoveries: PatternDiscovery[]): RiskHypothesis[] {
    const hypotheses: RiskHypothesis[] = [];
    const now = Date.now();

    for (const disc of discoveries) {
      if (disc.category.includes('CONFIG')) {
        hypotheses.push({
          hypothesisId: `HYP-CFG-${now}`,
          title: 'Outdated GAS Deployment ID Recurrence Hypothesis',
          statement: 'Releases under target branch main with modified config.js carry high probability of GAS ID mismatch.',
          targetGate: 'Gate-004',
          suspectedCause: 'Stale gasWebAppUrl left un-updated during rapid release iterations.',
          suggestedCheck: 'Validate gasWebAppUrl against active deployment registry endpoint prior to release.',
          probability: Math.min(95, disc.confidenceScore + 10)
        });
      }

      if (disc.category.includes('ROOT') || disc.category.includes('PATH')) {
        hypotheses.push({
          hypothesisId: `HYP-ROOT-${now}`,
          title: 'Publish Root Boundary Drift Hypothesis',
          statement: 'Edited frontend assets in nested subdirectories risk publishing outside designated publish root.',
          targetGate: 'Gate-003',
          suspectedCause: 'Nested relative paths in multi-branch workspace configurations.',
          suggestedCheck: 'Enforce absolute path validation for targetPublishRoot.',
          probability: Math.min(90, disc.confidenceScore + 5)
        });
      }

      if (disc.category.includes('FINGERPRINT')) {
        hypotheses.push({
          hypothesisId: `HYP-FINGERPRINT-${now}`,
          title: 'Build Hash Asynchrony Hypothesis',
          statement: 'Assets updated post-build stage produce hash mismatch in Gate-007.',
          targetGate: 'Gate-007',
          suspectedCause: 'Asynchronous post-processing modifying static bundles after fingerprint computation.',
          suggestedCheck: 'Re-compute SHA256 fingerprint immediately before processRelease call.',
          probability: 85
        });
      }
    }

    // デフォルト仮説
    if (hypotheses.length === 0) {
      hypotheses.push({
        hypothesisId: `HYP-GEN-${now}`,
        title: 'Environment Policy Divergence Hypothesis',
        statement: 'Production deployments exhibit stricter warning tolerance than staging.',
        targetGate: 'Gate-001~008',
        suspectedCause: 'Environment policy setting differences.',
        suggestedCheck: 'Pre-eval with verifyDryRun in production mode.',
        probability: 70
      });
    }

    return hypotheses;
  }
}
