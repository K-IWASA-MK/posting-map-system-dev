/**
 * TaskContractFactory.ts
 * 
 * AIOS Task Gateway Contract Factory
 * Deterministic, stateless factory that generates immutable TaskContracts.
 */

import { CEODecisionInput, TaskIntent, TaskPriority } from '../models/TaskGatewayModels';
import { WorkflowProfileDefinition } from '../models/WorkflowProfileModels';
import { WorkflowProfile } from '../models/WorkflowProfile';
import { OutputPolicy } from '../models/OutputPolicyModels';
import { TaskContract } from '../models/TaskContractModels';

export class TaskContractFactory {
  /**
   * Deterministically generates a fully frozen TaskContract.
   * Stateless, Immutable, Deterministic, Side Effect Free.
   */
  public static createContract(
    input: CEODecisionInput,
    intent: TaskIntent,
    workflow: WorkflowProfileDefinition,
    outputPolicy: OutputPolicy
  ): TaskContract {
    const timestamp = input.timestamp || '2026-07-29T00:00:00.000Z';
    const taskId = input.taskId || TaskContractFactory.generateDeterministicTaskId(input.ceoInput, timestamp);
    const priority: TaskPriority = input.requestedPriority || workflow.defaultPriority;

    const dod: ReadonlyArray<string> = input.definitionOfDone && input.definitionOfDone.length > 0
      ? Object.freeze([...input.definitionOfDone])
      : Object.freeze([
          `Full compliance with AIOS First Principle & Blueprint First.`,
          `Execution of workflow profile [${workflow.profileName}] stages (${workflow.workflowStages.join(' -> ')}).`,
          `Output formatted in accordance with OutputPolicy (Primary Language: JA).`,
          `Passing all quality gates.`
        ]);

    const provenance = Object.freeze({
      ceoInput: input.ceoInput,
      timestamp,
      metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined
    });

    const workflowProfileObject: WorkflowProfile = Object.freeze({
      workflowType: workflow.profileName,
      stages: workflow.workflowStages,
      outputPolicy: Object.freeze({
        language: 'ja',
        codeLanguage: 'en',
        documentationLanguage: 'ja'
      }),
      completionPolicy: Object.freeze({
        requireVerification: true,
        requireGitCommit: true,
        requireGitPush: true,
        requireWalkthrough: true,
        requireHandover: true
      })
    });

    const contract: TaskContract = Object.freeze({
      taskId,
      intent,
      workflowProfile: workflowProfileObject,
      workflowStages: workflow.workflowStages,
      priority,
      status: 'CONTRACT_GENERATED',
      outputLanguage: 'JA',
      outputPolicy,
      createdAt: timestamp,
      definitionOfDone: dod,
      ceoDecision: provenance
    });

    return contract;
  }

  /**
   * Generates a deterministic Task ID based on input content and timestamp.
   */
  private static generateDeterministicTaskId(input: string, timestamp: string): string {
    let hash = 0;
    const str = `${input}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `TASK-GW-${positiveHash}`;
  }
}
