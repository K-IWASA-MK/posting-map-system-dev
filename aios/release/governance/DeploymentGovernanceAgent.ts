/**
 * DeploymentGovernanceAgent.ts
 * 
 * Deployment Target Verification Gate - Governance Agent Orchestrator (Sprint DTVG-12)
 * DTVG-01〜11 の全コンポーネント (Target Verification, Risk Predictor, Feedback Loop,
 * Improvement Engine, Approval Intelligence, Governance Reporter) を統括する Agent 層。
 */

import { DeploymentTargetVerificationGate } from '../gates/DeploymentTargetVerificationGate';
import { DeploymentGateResult } from '../gates/types/DeploymentTargetGateTypes';
import { DeploymentFeedbackAnalyzer } from '../feedback/DeploymentFeedbackAnalyzer';
import { DeploymentImprovementEngine } from '../improvement/DeploymentImprovementEngine';
import { DeploymentApprovalIntelligence } from '../approval/DeploymentApprovalIntelligence';
import { ExecutionLedgerRegistry, ExecutionState } from '../../../sdk/ExecutionLedgerRegistry';
import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';
import {
  DeploymentGovernanceRequest,
  GovernanceExecutionResult,
  GovernanceAgentStatus,
  GovernanceStageResult,
  GovernanceReport
} from './DeploymentGovernanceAgentTypes';
import { DeploymentGovernanceReporter } from './DeploymentGovernanceReporter';

export class DeploymentGovernanceAgent {
  private readonly workspaceRoot: string;
  private readonly gate: DeploymentTargetVerificationGate;
  private readonly feedbackAnalyzer: DeploymentFeedbackAnalyzer;
  private readonly improvementEngine: DeploymentImprovementEngine;
  private readonly approvalIntelligence: DeploymentApprovalIntelligence;
  private status: GovernanceAgentStatus;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.gate = new DeploymentTargetVerificationGate(this.workspaceRoot);
    this.feedbackAnalyzer = new DeploymentFeedbackAnalyzer();
    this.improvementEngine = new DeploymentImprovementEngine();
    this.approvalIntelligence = new DeploymentApprovalIntelligence();
    this.status = 'INITIALIZING';
  }

  /**
   * 現在の Agent ステータスを取得
   */
  public getStatus(): GovernanceAgentStatus {
    return this.status;
  }

  /**
   * SSOT レジストリ登録の確保
   */
  private ensureSSOTRegistrations(): void {
    const capId = "cap-deployment-gate";
    const pipeId = "pipe-release-verification";
    const skillId = "skill-deployment-target-verification";

    if (!CapabilityRegistry.get(capId)) {
      try {
        CapabilityRegistry.register({
          capabilityId: capId,
          capabilityName: "Deployment Target Verification",
          category: CapabilityCategory.Release,
          description: "Capability for verifying deployment targets",
          priority: 1,
          status: CapabilityStatus.ACTIVE,
          version: "1.0.0",
          supportedSkillIds: [skillId]
        });
      } catch (e) {}
    }

    if (!SkillRegistry.get(skillId)) {
      try {
        SkillRegistry.register({
          skillId: skillId,
          skillName: "Deployment Target Verification Skill",
          category: SkillCategory.Audit,
          description: "Skill to verify deployment target integrity",
          capabilityId: capId,
          priority: 1,
          version: "1.0.0",
          status: SkillStatus.ACTIVE
        });
      } catch (e) {}
    }

    if (!SkillPipelineRegistry.get(pipeId)) {
      try {
        const now = new Date().toISOString();
        SkillPipelineRegistry.register({
          pipelineId: pipeId,
          pipelineName: "Release Verification Pipeline",
          capabilityId: capId,
          description: "Pipeline for release verification",
          skillIds: [skillId],
          priority: 1,
          status: SkillPipelineStatus.ACTIVE,
          version: "1.0.0",
          pipelineVersion: "1.0.0",
          createdAt: now,
          updatedAt: now
        });
      } catch (e) {}
    }
  }

  /**
   * Deployment Governance Agent のメインパイプライン実行
   */
  public async execute(request: DeploymentGovernanceRequest): Promise<GovernanceExecutionResult> {
    const startTime = Date.now();
    const stageResults: GovernanceStageResult[] = [];
    const req = request.gateRequest;

    // Stage 1: INITIALIZING
    this.status = 'INITIALIZING';
    const initStart = Date.now();
    this.ensureSSOTRegistrations();
    stageResults.push({
      stage: 'INITIALIZING',
      status: 'PASS',
      detail: `Initialized DeploymentGovernanceAgent for release '${req.releaseId}'.`,
      durationMs: Date.now() - initStart
    });

    // Stage 2: VERIFYING (Target Verification Gate-001~007)
    this.status = 'VERIFYING';
    const verifyStart = Date.now();
    let gateResult: DeploymentGateResult;

    if (request.runDryRun) {
      const dryRun = await this.gate.verifyDryRun(req);
      gateResult = dryRun.simulatedResult;
    } else {
      gateResult = await this.gate.verify(req);
    }

    const passedGates = gateResult.gateResults.filter(g => g.status === 'PASS').length;
    const failedGates = gateResult.gateResults.filter(g => g.status === 'FAIL').length;
    const totalGates = gateResult.gateResults.length;

    stageResults.push({
      stage: 'VERIFYING',
      status: gateResult.overallStatus === 'FAIL' ? 'FAIL' : 'PASS',
      detail: `Evaluated ${totalGates} Target Gates (${passedGates} PASSED, ${failedGates} FAILED).`,
      durationMs: Date.now() - verifyStart
    });

    // Stage 3: ANALYZING (Risk Prediction & Historical Feedback Analysis)
    this.status = 'ANALYZING';
    const analyzeStart = Date.now();
    const feedbackSummary = this.feedbackAnalyzer.analyzeAllLedgers(req.employeeId);
    stageResults.push({
      stage: 'ANALYZING',
      status: 'PASS',
      detail: `Analyzed ${feedbackSummary.totalDeployments} historical ledger records (Success Rate: ${feedbackSummary.successRate.toFixed(1)}%).`,
      durationMs: Date.now() - analyzeStart
    });

    // Stage 4: EVALUATING (Improvement Engine & Approval Intelligence)
    this.status = 'EVALUATING';
    const evalStart = Date.now();
    const recommendation = this.improvementEngine.generateRecommendation(req);
    const decisionReport = this.approvalIntelligence.evaluate(req);

    stageResults.push({
      stage: 'EVALUATING',
      status: decisionReport.decision === 'DENY' ? 'FAIL' : decisionReport.decision === 'REQUIRE_REVIEW' ? 'WARNING' : 'PASS',
      detail: `Approval Intelligence evaluated decision: ${decisionReport.decision} (Confidence: ${decisionReport.confidence}%).`,
      durationMs: Date.now() - evalStart
    });

    // Stage 5: REPORTING & Ledger Commitment
    this.status = 'REPORTING';
    const reportStart = Date.now();

    const reportId = `GOV-${req.releaseId}-${Date.now()}`;
    const generatedAt = new Date().toISOString();

    const report: GovernanceReport = {
      reportId,
      releaseId: req.releaseId,
      employeeId: req.employeeId,
      overallDecision: decisionReport.decision,
      confidence: decisionReport.confidence,
      riskLevel: recommendation.riskPrediction.riskLevel,
      gateSummary: {
        totalGates,
        passedGates,
        failedGates
      },
      stageResults,
      decisionReport,
      recommendation,
      reportMarkdown: '',
      generatedAt
    };

    report.reportMarkdown = DeploymentGovernanceReporter.generateReportMarkdown(report);

    stageResults.push({
      stage: 'REPORTING',
      status: 'PASS',
      detail: `Generated comprehensive governance report (ReportId: ${reportId}).`,
      durationMs: Date.now() - reportStart
    });

    // ExecutionLedger 記録
    let executionLedgerId: string | undefined;
    try {
      const numericId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
      executionLedgerId = `ledger-${numericId}`;

      ExecutionLedgerRegistry.register({
        executionId: executionLedgerId,
        ledgerVersion: '1.0.0',
        description: `DeploymentGovernanceAgent assessment for ${req.releaseId}`,
        capabilityId: 'cap-deployment-gate',
        pipelineId: 'pipe-release-verification',
        skillIds: ['skill-deployment-target-verification'],
        executionState: decisionReport.decision === 'DENY' ? ExecutionState.FAILED : ExecutionState.COMPLETED,
        timestamp: generatedAt,
        version: '1.0.0',
        createdAt: generatedAt,
        updatedAt: generatedAt,
        auditTrail: [
          `Agent: DeploymentGovernanceAgent`,
          `ReleaseId: ${req.releaseId}`,
          `Decision: ${decisionReport.decision}`,
          `Confidence: ${decisionReport.confidence}%`,
          `RiskLevel: ${recommendation.riskPrediction.riskLevel}`,
          `GateSummary: ${passedGates}/${totalGates} PASSED`
        ]
      });
    } catch (err) {
      console.warn('[DeploymentGovernanceAgent] Ledger registration notice:', err);
    }

    this.status = decisionReport.decision === 'DENY' ? 'FAILED' : 'COMPLETED';

    return {
      agentStatus: this.status,
      report,
      executionLedgerId
    };
  }
}
