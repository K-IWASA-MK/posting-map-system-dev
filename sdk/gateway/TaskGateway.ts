/**
 * TaskGateway.ts
 * 
 * AIOS Task Gateway Foundation
 * 
 * ============================================================================
 * AIOS FIRST PRINCIPLE (AIOS 第一原則)
 * ============================================================================
 * Antigravity IDE上のすべての業務指示は、チャット相手となる生成AIの種類を問わず、
 * 必ずTask Gatewayを経由してAIOSへ受理される。
 * AI社員へ直接タスクを渡してはならない。
 * Task Gatewayのみが正式なTask Contractを生成できる。
 * ============================================================================
 * 
 * Foundation Rules:
 * - Stateless: Class contains no instance or mutable module state.
 * - Immutable: All returned TaskContract objects are completely frozen.
 * - Deterministic: Pure function execution with no unseeded random or internal clock side-effects.
 * - Side Effect Free: No database, queue, or network I/O.
 */

import { CEODecisionInput, TaskGatewayResult } from './models/TaskGatewayModels';
import { TaskContract } from './models/TaskContractModels';
import { IntentClassifier } from './domain/IntentClassifier';
import { WorkflowSelector } from './domain/WorkflowSelector';
import { OutputPolicyResolver } from './domain/OutputPolicyResolver';
import { TaskContractFactory } from './domain/TaskContractFactory';

export class TaskGateway {
  /**
   * AIOS First Principle Statement string for constitutional inspection.
   */
  public static readonly FIRST_PRINCIPLE = Object.freeze(
    'Antigravity IDE上のすべての業務指示は、チャット相手となる生成AIの種類を問わず、必ずTask Gatewayを経由してAIOSへ受理される。AI社員へ直接タスクを渡してはならない。Task Gatewayのみが正式なTask Contractを生成できる。'
  );

  /**
   * Receives a CEO decision input and processes it into an immutable AIOS TaskContract.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static processCEODecision(input: CEODecisionInput): TaskGatewayResult {
    // 1. Validation
    if (!input || typeof input.ceoInput !== 'string' || input.ceoInput.trim().length === 0) {
      throw new Error('[TaskGateway] Request rejected: CEO decision input text must be a non-empty string.');
    }

    // 2. Intent Classification
    const intent = IntentClassifier.classify(input.ceoInput, input.metadata);

    // 3. Workflow Selection & Stage Pipeline Resolution
    const workflow = WorkflowSelector.selectWorkflow(intent);

    // 4. Output Policy Resolution
    const outputPolicy = OutputPolicyResolver.resolvePolicy();

    // 5. Immutable Task Contract Generation
    const contract: TaskContract = TaskContractFactory.createContract(
      input,
      intent,
      workflow,
      outputPolicy
    );

    // 6. Return frozen result
    const acceptedAt = input.timestamp || '2026-07-29T00:00:00.000Z';
    return Object.freeze({
      contract,
      acceptedAt
    });
  }

  /**
   * Alias for processCEODecision to support submit semantics.
   */
  public static submitCEODecision(input: CEODecisionInput): TaskGatewayResult {
    return TaskGateway.processCEODecision(input);
  }
}
