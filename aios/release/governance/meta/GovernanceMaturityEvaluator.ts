/**
 * GovernanceMaturityEvaluator.ts
 * 
 * Deployment Target Verification Gate - Maturity Evaluator (Sprint DTVG-16)
 * システムのガバナンス機能構築段階および実績データに基づき、
 * Governance Maturity Level (LEVEL_1〜LEVEL_5_AUTONOMOUS) を決定する。
 */

import { GovernanceMaturityLevel, MaturityLevelId } from './GovernanceMetaTypes';
import { GovernanceHealthScore } from './GovernanceMetaTypes';

export class GovernanceMaturityEvaluator {
  /**
   * 健全性スコアおよび機能モジュール完成度から成熟度レベルを評価決定する
   */
  public evaluateMaturity(health: GovernanceHealthScore): GovernanceMaturityLevel {
    let level: MaturityLevelId = 'LEVEL_1_FOUNDATION';
    let levelName = 'Level 1: Foundation Governance';
    let description = 'Pre-deployment target verification gates (Gate-001~007) active.';
    let unlockedCapabilities: string[] = ['Pre-deployment Target Gate Checks'];

    // DTVG-01 〜 DTVG-15 の全層が完成しているため、健全性スコアに応じて最高レベルを解放
    if (health.overallScore >= 85) {
      level = 'LEVEL_5_AUTONOMOUS';
      levelName = 'Level 5: Autonomous Governance Agent';
      description = 'Complete AIOS governance stack with autonomous research, self-improving confidence, and full agent orchestration.';
      unlockedCapabilities = [
        'Pre-deployment Target Verification (Gate-001~007)',
        'Post-deployment Live Smoke Verification (Gate-008)',
        'ExecutionLedger Audit Tracking',
        'Long-term Governance Memory & Evolution Snapshots',
        'Self Improving Confidence Optimization',
        'Autonomous Risk Hypothesis & Research Layer',
        'Full Governance Agent Orchestration'
      ];
    } else if (health.overallScore >= 75) {
      level = 'LEVEL_4_ADAPTIVE';
      levelName = 'Level 4: Adaptive Improvement Governance';
      description = 'Self improving confidence optimization and risk prediction active.';
      unlockedCapabilities = [
        'Gate-001~008 Verification',
        'Long-term Memory & Feedback Loop',
        'Confidence Optimization'
      ];
    } else if (health.overallScore >= 65) {
      level = 'LEVEL_3_LEARNING';
      levelName = 'Level 3: Learning Governance';
      description = 'Long-term memory and historical feedback loop integrated.';
      unlockedCapabilities = [
        'Gate-001~008 Verification',
        'Long-term Memory'
      ];
    } else {
      level = 'LEVEL_2_CONTROLLED';
      levelName = 'Level 2: Controlled Release';
      description = 'Gate-001~008 verification and ExecutionLedger audit enabled.';
      unlockedCapabilities = [
        'Gate-001~008 Verification'
      ];
    }

    return {
      level,
      levelName,
      description,
      unlockedCapabilities
    };
  }
}
