/**
 * DeploymentFeedbackAnalyzer.ts
 * 
 * Deployment Target Verification Gate - Feedback Analyzer Layer (Sprint DTVG-09)
 * ExecutionLedger のガバナンス記録から Gate FAIL 要因を解析し、
 * Failure Pattern の抽出および Improvement Recommendation の生成を行う。
 */

import { ExecutionLedgerRegistry, ExecutionRecord, ExecutionState } from '../../../sdk/ExecutionLedgerRegistry';
import { AIEmployeeRegistry } from '../../../sdk/employee/manager/registry/AIEmployeeRegistry';
import {
  DeploymentFeedback,
  DeploymentLearningRecord,
  FailureCategory,
  FailurePattern,
  ImprovementRecommendation
} from './DeploymentFeedbackTypes';
import { DeploymentKnowledgeRegistry } from './DeploymentKnowledgeRegistry';

export class DeploymentFeedbackAnalyzer {

  /**
   * ExecutionRecord 1件から失敗要因を解析し、学習レコードを生成する
   */
  public analyzeRecord(record: ExecutionRecord): DeploymentLearningRecord {
    DeploymentKnowledgeRegistry.initializeDefaults();

    const auditText = record.auditTrail.join('\n');
    const releaseIdMatch = auditText.match(/ReleaseId:\s*([^\n]+)/i);
    const releaseId = releaseIdMatch ? releaseIdMatch[1].trim() : record.executionId;
    const employeeId = 'emp-aios-deployer'; // デフォルト参照

    const extractedPatterns: FailurePattern[] = [];
    const recommendations: ImprovementRecommendation[] = [];

    // Gate-001 Repository Mismatch
    if (auditText.includes('Gate-001') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-REPO-001');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-001`,
        employeeId,
        releaseId,
        category: 'REPOSITORY_MISMATCH',
        summary: 'Target Repository Mismatch Detected',
        actionableAdvice: 'Verify repository name against git remote origin before invoking ReleaseRuntime.',
        severity: 'CRITICAL'
      });
    }

    // Gate-002 Branch Mismatch
    if (auditText.includes('Gate-002') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-BRANCH-002');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-002`,
        employeeId,
        releaseId,
        category: 'BRANCH_MISMATCH',
        summary: 'Target Branch Mismatch Detected',
        actionableAdvice: 'Checkout the intended git branch prior to triggering deployment release.',
        severity: 'HIGH'
      });
    }

    // Gate-003 Publish Root Mismatch
    if (auditText.includes('Gate-003') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-ROOT-003');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-003`,
        employeeId,
        releaseId,
        category: 'PUBLISH_ROOT_MISMATCH',
        summary: 'Publish Root Boundary Violation Detected',
        actionableAdvice: 'Confirm edited files are contained inside target publish root to prevent unintended file publishing.',
        severity: 'CRITICAL'
      });
    }

    // Gate-004 Runtime Config Mismatch
    if (auditText.includes('Gate-004') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-CONFIG-004');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-004`,
        employeeId,
        releaseId,
        category: 'RUNTIME_CONFIG_MISMATCH',
        summary: 'Stale Runtime Config Detected',
        actionableAdvice: 'Synchronize config.js gasWebAppUrl with active backend deployment registry ID.',
        severity: 'CRITICAL'
      });
    }

    // Gate-005 AI Employee Authorization
    if (auditText.includes('Gate-005') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-AUTH-005');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-005`,
        employeeId,
        releaseId,
        category: 'EMPLOYEE_AUTHORIZATION_VIOLATION',
        summary: 'AI Employee Profile Violation Detected',
        actionableAdvice: 'Ensure execution context sets profileName explicitly to "AI Employee Profile".',
        severity: 'HIGH'
      });
    }

    // Gate-007 Fingerprint Mismatch
    if (auditText.includes('Gate-007') && auditText.includes('FAIL')) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-FINGERPRINT-007');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-007`,
        employeeId,
        releaseId,
        category: 'FINGERPRINT_MISMATCH',
        summary: 'Deployment Fingerprint Hash Mismatch',
        actionableAdvice: 'Re-calculate fingerprint payload after build steps to ensure release payload integrity.',
        severity: 'HIGH'
      });
    }

    // Gate-008 Post-Deployment Smoke Fail
    if (auditText.includes('Gate-008') && (auditText.includes('FAIL') || record.executionState === ExecutionState.FAILED)) {
      const pat = DeploymentKnowledgeRegistry.getPattern('PAT-SMOKE-008');
      if (pat) extractedPatterns.push(pat);
      recommendations.push({
        recommendationId: `REC-${Date.now()}-008`,
        employeeId,
        releaseId,
        category: 'POST_DEPLOYMENT_SMOKE_FAIL',
        summary: 'Post-Deployment Smoke Check Failure',
        actionableAdvice: 'Perform verifyDryRun and verify live backend health prior to final production release.',
        severity: 'CRITICAL'
      });
    }

    const learningRecord: DeploymentLearningRecord = {
      recordId: `LRN-${record.executionId}`,
      employeeId,
      releaseId,
      overallStatus: record.executionState,
      extractedPatterns,
      recommendations,
      learnedAt: new Date().toISOString()
    };

    DeploymentKnowledgeRegistry.recordLearning(learningRecord);
    return learningRecord;
  }

  /**
   * ExecutionLedgerRegistry 全体を解析し、AI Employee 全体のフィードバックサマリーを生成する
   */
  public analyzeAllLedgers(employeeId: string = 'emp-aios-deployer'): DeploymentFeedback {
    const records = ExecutionLedgerRegistry.getAll();
    const learningRecords: DeploymentLearningRecord[] = [];

    let successful = 0;
    let failed = 0;

    const patternCounts: Map<string, { pattern: FailurePattern; occurrences: number }> = new Map();

    for (const record of records) {
      if (record.executionState === ExecutionState.COMPLETED) {
        successful++;
      } else if (record.executionState === ExecutionState.FAILED) {
        failed++;
      }

      const learned = this.analyzeRecord(record);
      learningRecords.push(learned);

      for (const pat of learned.extractedPatterns) {
        const existing = patternCounts.get(pat.patternId);
        if (existing) {
          existing.occurrences++;
        } else {
          patternCounts.set(pat.patternId, { pattern: pat, occurrences: 1 });
        }
      }
    }

    const total = records.length;
    const successRate = total > 0 ? (successful / total) * 100 : 100;

    const topFailurePatterns = Array.from(patternCounts.values())
      .sort((a, b) => b.occurrences - a.occurrences);

    return {
      employeeId,
      totalDeployments: total,
      successfulDeployments: successful,
      failedDeployments: failed,
      successRate,
      recentLearningRecords: learningRecords,
      topFailurePatterns
    };
  }
}
