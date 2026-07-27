/**
 * DeploymentImprovementEngine.ts
 * 
 * Deployment Target Verification Gate - Autonomous Improvement Engine (Sprint DTVG-10)
 * リスク予測結果および過去の失敗ナレッジに基づき、デプロイ前の予防的提案 (ImprovementSuggestion)
 * ならびに AI Employee 向けプロンプトコンテキスト (aiPromptContext) を自動生成する。
 */

import { DeploymentGateRequest } from '../gates/types/DeploymentTargetGateTypes';
import { DeploymentKnowledgeRegistry } from '../feedback/DeploymentKnowledgeRegistry';
import { DeploymentRiskPredictor } from './DeploymentRiskPredictor';
import {
  DeploymentRecommendation,
  ImprovementSuggestion,
  PreventiveAction,
  ImprovementConfidence
} from './DeploymentImprovementTypes';

export class DeploymentImprovementEngine {
  private readonly riskPredictor: DeploymentRiskPredictor;

  constructor() {
    this.riskPredictor = new DeploymentRiskPredictor();
  }

  /**
   * DeploymentGateRequest から事前改善提案および AI Employee コンテキストを生成する
   */
  public generateRecommendation(request: DeploymentGateRequest): DeploymentRecommendation {
    DeploymentKnowledgeRegistry.initializeDefaults();

    const riskPrediction = this.riskPredictor.predictRisk(request);
    const suggestions: ImprovementSuggestion[] = [];

    // 高リスク時の対策案追加
    if (riskPrediction.predictedFailures.includes('Gate-004 (Runtime Config Match)')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-CONFIG-004');
      const actions: PreventiveAction[] = [
        {
          actionId: 'ACT-CONFIG-001',
          title: 'Sync Frontend Config Endpoint',
          description: 'Update config.js gasWebAppUrl with active backend GAS Deployment ID before executing release.',
          targetGate: 'Gate-004',
          requiresApproval: true
        }
      ];

      suggestions.push({
        suggestionId: `SUG-CONFIG-${Date.now()}`,
        title: 'Prevent Stale Runtime Endpoint Incident',
        category: 'RUNTIME_CONFIG_MISMATCH',
        preventiveActions: actions,
        confidence: 'HIGH' as ImprovementConfidence,
        expectedImpact: 'Prevents routing frontend users to outdated backend GAS instance.'
      });
    }

    if (riskPrediction.predictedFailures.includes('Gate-003 (Publish Root Match)')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-ROOT-003');
      const actions: PreventiveAction[] = [
        {
          actionId: 'ACT-ROOT-001',
          title: 'Verify Target Publish Root Boundary',
          description: 'Ensure target asset is placed under the designated published root folder.',
          targetGate: 'Gate-003',
          requiresApproval: true
        }
      ];

      suggestions.push({
        suggestionId: `SUG-ROOT-${Date.now()}`,
        title: 'Prevent Publish Root Boundary Violation',
        category: 'PUBLISH_ROOT_MISMATCH',
        preventiveActions: actions,
        confidence: 'HIGH' as ImprovementConfidence,
        expectedImpact: 'Prevents releasing files to wrong publication directories.'
      });
    }

    if (riskPrediction.predictedFailures.includes('Gate-001 (Repository Match)')) {
      const actions: PreventiveAction[] = [
        {
          actionId: 'ACT-REPO-001',
          title: 'Verify Repository Origin Name',
          description: 'Confirm targetRepository matches git remote origin url.',
          targetGate: 'Gate-001',
          requiresApproval: false
        }
      ];

      suggestions.push({
        suggestionId: `SUG-REPO-${Date.now()}`,
        title: 'Correct Requested Repository Identity',
        category: 'REPOSITORY_MISMATCH',
        preventiveActions: actions,
        confidence: 'HIGH' as ImprovementConfidence,
        expectedImpact: 'Ensures release request targets correct repository.'
      });
    }

    // デフォルトの安全提案
    if (suggestions.length === 0) {
      suggestions.push({
        suggestionId: `SUG-GENERAL-${Date.now()}`,
        title: 'Standard Deployment Guidance',
        category: 'GENERAL_SAFETY',
        preventiveActions: [
          {
            actionId: 'ACT-DRYRUN-001',
            title: 'Run Dry Run Pre-check',
            description: 'Execute verifyDryRun() prior to final deployment release.',
            targetGate: 'Gate-001~008',
            requiresApproval: false
          }
        ],
        confidence: 'HIGH' as ImprovementConfidence,
        expectedImpact: 'Guarantees zero-friction deployment release.'
      });
    }

    // AI Employee 向けコンテキストテキストの動的生成
    const aiPromptContext = this.buildAIPromptContext(request, riskPrediction, suggestions);

    return {
      recommendationId: `REC-${request.releaseId}-${Date.now()}`,
      releaseId: request.releaseId,
      employeeId: request.employeeId,
      riskPrediction,
      suggestions,
      aiPromptContext,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * AI Employee の決定・レビュー向けの事前指示テキスト (aiPromptContext) を構築する
   */
  private buildAIPromptContext(
    request: DeploymentGateRequest,
    risk: any,
    suggestions: ImprovementSuggestion[]
  ): string {
    const lines: string[] = [];
    lines.push(`[AI Employee Deployment Governance Pre-Context]`);
    lines.push(`Release ID: ${request.releaseId}`);
    lines.push(`Target Environment: ${request.environment.toUpperCase()}`);
    lines.push(`Assessed Risk Level: ${risk.riskLevel} (Risk Score: ${risk.score}/100)`);
    lines.push(`Risk Reason: ${risk.reason}`);

    if (risk.predictedFailures.length > 0) {
      lines.push(`Predicted Failure Gates: ${risk.predictedFailures.join(', ')}`);
    }

    lines.push(`\n[Preventive Suggestions]`);
    for (const sug of suggestions) {
      lines.push(`- ${sug.title} (Category: ${sug.category}, Confidence: ${sug.confidence})`);
      for (const act of sug.preventiveActions) {
        lines.push(`   * Action: ${act.title} -> ${act.description} (Requires Approval: ${act.requiresApproval})`);
      }
    }

    lines.push(`\n[Autonomous Action Rule]`);
    lines.push(`Do NOT attempt unapproved code or git mutations. If risk is HIGH or CRITICAL, present these recommendations for CEO/Policy approval prior to calling processRelease().`);

    return lines.join('\n');
  }
}
