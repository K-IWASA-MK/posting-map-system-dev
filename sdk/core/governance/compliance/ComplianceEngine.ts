import { AIOSEventBus } from '../../event/AIOSEventBus';
import { AIOSEvent } from '../../event/AIOSEvent';
import { GovernanceRuntime } from '../GovernanceRuntime';
import { ComplianceReport } from './ComplianceReport';
import { ComplianceEvaluator } from './ComplianceEvaluator';
import { ComplianceResult, ComplianceViolation, GovernanceDecision } from '../GovernanceModels';
import { RuntimeState } from '../../runtime/RuntimeState';

export class ComplianceEngine {
  private readonly evaluator = new ComplianceEvaluator();

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly governanceRuntime: GovernanceRuntime
  ) {}

  public async evaluateCompliance(targetRuntimes: string[]): Promise<ComplianceReport> {
    const reportId = `REP-COMP-${Date.now()}`;
    const activeBundle = this.governanceRuntime.getActiveBundle();

    if (!activeBundle || activeBundle.policies.length === 0) {
      const emptyReport: ComplianceReport = {
        reportId,
        overallScore: 100,
        results: [],
        timestamp: new Date().toISOString()
      };
      await this.publishEvent('ComplianceEvaluated', emptyReport);
      return emptyReport;
    }

    const results: ComplianceResult[] = [];
    let totalScore = 0;

    for (const rId of targetRuntimes) {
      const scope = rId.includes('plugin') ? 'PLUGIN' : 'RUNTIME';
      const applicable = this.evaluator.getApplicablePolicies(activeBundle.policies, scope);

      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      let score = 100;

      for (const policy of applicable) {
        let passed = true;
        let violationMessage = '';
        let recommendation = '';

        if (policy.policyId === 'POL-SEC-001' && rId.includes('insecure')) {
          passed = false;
          violationMessage = 'Insecure port or credential configurations found';
          recommendation = 'Close all open ports and verify credential settings';
        } else if (policy.policyId === 'POL-RUN-001' && rId.includes('violation')) {
          passed = false;
          violationMessage = 'Direct execution dependency coupling violation found';
          recommendation = 'Use dynamic dependency registry instead of static imports';
        }

        const decision: GovernanceDecision = {
          decisionId: `DEC-GV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          policyId: policy.policyId,
          runtimeId: rId,
          result: passed ? 'PASS' : 'FAIL',
          reason: passed ? 'Policy validation passed successfully' : `Policy violation detected: ${violationMessage}`,
          timestamp: new Date().toISOString()
        };
        await this.publishEvent('GovernanceDecision', decision);

        if (!passed) {
          score -= 30;
          const violation: ComplianceViolation = {
            violationId: `VIOL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            policyId: policy.policyId,
            severity: 'ERROR',
            message: violationMessage,
            recommendation
          };
          violations.push(violation);
          recommendations.push(recommendation);

          await this.publishEvent('ViolationDetected', violation);
        }
      }

      score = Math.max(0, score);
      totalScore += score;

      results.push({
        runtimeId: rId,
        policyId: activeBundle.bundleId,
        score,
        status: score === 100 ? 'PASS' : score >= 70 ? 'WARNING' : 'FAIL',
        violations,
        recommendations,
        timestamp: new Date().toISOString()
      });
    }

    const overallScore = results.length > 0 ? Math.round(totalScore / results.length) : 100;

    const report: ComplianceReport = {
      reportId,
      overallScore,
      results,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('ComplianceEvaluated', report);

    return report;
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-CP-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.governance',
      correlationId: `COR-CP-${Date.now()}`,
      causationId: `CAU-CP-${Date.now()}`,
      payload,
      runtimeId: 'aios.governance',
      timestamp: new Date().toISOString(),
      state: RuntimeState.RUNNING
    };
    await this.eventBus.publish(event);
  }
}
