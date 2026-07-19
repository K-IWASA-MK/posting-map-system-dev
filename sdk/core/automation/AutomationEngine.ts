import { QueueItem, AutomationDecision, AutomationResult } from './AutomationModels';
import { AutomationActionRegistry } from './AutomationActionRegistry';

export class AutomationEngine {
  private queue: QueueItem[] = [];
  private lastExecutedTime = new Map<string, number>();
  private retryCounts = new Map<string, number>();

  public queueAction(
    item: QueueItem,
    policyPassed: boolean,
    platformHealth: string,
    cooldownMs: number,
    maxRetries: number
  ): AutomationDecision {
    const decisionId = `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    // 7. Safety Guard Audits
    // A. Check Policy
    if (!policyPassed) {
      return {
        decisionId,
        recommendationId: item.recommendationId,
        policyResult: 'FAIL',
        approvalResult: 'REJECTED',
        reason: 'Rejected: Quality Policy failed validation (Policy FAIL)',
        timestamp
      };
    }

    // B. Check Platform Health
    if (platformHealth === 'UNHEALTHY') {
      return {
        decisionId,
        recommendationId: item.recommendationId,
        policyResult: 'PASS',
        approvalResult: 'REJECTED',
        reason: 'Rejected: Target platform state is currently UNHEALTHY',
        timestamp
      };
    }

    // C. Check Cooldown
    const lastFired = this.lastExecutedTime.get(item.actionName) || 0;
    if (Date.now() - lastFired < cooldownMs) {
      return {
        decisionId,
        recommendationId: item.recommendationId,
        policyResult: 'PASS',
        approvalResult: 'REJECTED',
        reason: `Rejected: Action is currently cooling down (${cooldownMs}ms required)`,
        timestamp
      };
    }

    // D. Check Retry Limit
    const retries = this.retryCounts.get(item.recommendationId) || 0;
    if (retries >= maxRetries) {
      return {
        decisionId,
        recommendationId: item.recommendationId,
        policyResult: 'PASS',
        approvalResult: 'REJECTED',
        reason: `Rejected: Action has exceeded maximum retry attempts (${maxRetries})`,
        timestamp
      };
    }

    // E. Check Expiration
    if (Date.now() > item.expiresAt) {
      return {
        decisionId,
        recommendationId: item.recommendationId,
        policyResult: 'PASS',
        approvalResult: 'REJECTED',
        reason: 'Rejected: Action execution window has expired',
        timestamp
      };
    }

    // Passed all guards: Add to prioritized queue
    this.queue.push(item);
    // Sort queue by priority ascending (1 is higher priority than 3), then scheduledAt ascending
    this.queue.sort((a, b) => a.priority - b.priority || a.scheduledAt - b.scheduledAt);

    // Record attempt
    this.retryCounts.set(item.recommendationId, retries + 1);

    return {
      decisionId,
      recommendationId: item.recommendationId,
      policyResult: 'PASS',
      approvalResult: 'APPROVED',
      reason: 'Approved: Safety check passed successfully',
      timestamp
    };
  }

  public async executeNext(registry: AutomationActionRegistry): Promise<AutomationResult | undefined> {
    const item = this.queue.shift();
    if (!item) return undefined;

    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    const actionId = `ACT-EXEC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const executor = registry.get(item.actionName);

    if (!executor) {
      return {
        actionId,
        runtimeId: 'aios.automation',
        executionId: `EXEC-ERR-${Date.now()}`,
        status: 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: `Executor not found for action: ${item.actionName}`
      };
    }

    try {
      await executor({ recommendationId: item.recommendationId });
      this.lastExecutedTime.set(item.actionName, Date.now());

      return {
        actionId,
        runtimeId: 'aios.automation',
        executionId: `EXEC-SUCC-${Date.now()}`,
        status: 'success',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        actionId,
        runtimeId: 'aios.automation',
        executionId: `EXEC-ERR-${Date.now()}`,
        status: 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: err.message
      };
    }
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}
