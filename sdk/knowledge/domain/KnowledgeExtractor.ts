/**
 * KnowledgeExtractor.ts
 * 
 * AIOS Knowledge Extractor
 * Pure function extracting facts vs inferences, auditable confidence factors, and evidence references.
 */

import { TaskContract } from '../../gateway';
import { AssignmentContract, CapabilityType } from '../../dispatcher';
import { LifecycleRecord } from '../../lifecycle';
import { CandidateType, ConfidenceFactor, KnowledgeCandidate } from '../models/KnowledgeCandidateModels';

export class KnowledgeExtractor {
  /**
   * Deterministically extracts a frozen KnowledgeCandidate from verified lifecycle artifacts.
   * Stateless, Immutable, Deterministic, Side Effect Free.
   */
  public static extractCandidate(
    lifecycle: LifecycleRecord,
    assignment: AssignmentContract,
    contract: TaskContract,
    timestamp: string
  ): KnowledgeCandidate {
    const candidateId = KnowledgeExtractor.generateDeterministicCandidateId(contract.taskId, lifecycle.lifecycleId, timestamp);
    const candidateType = KnowledgeExtractor.determineCandidateType(contract.intent);

    const facts: ReadonlyArray<string> = Object.freeze([
      `Task ID: ${contract.taskId}`,
      `Lifecycle ID: ${lifecycle.lifecycleId}`,
      `Source Assignment ID: ${assignment.assignmentId}`,
      `Task Intent: ${contract.intent}`,
      `Assigned Role: ${assignment.requiredRole}`,
      `Assigned Agent ID: ${assignment.selectedAgent.agentId}`,
      `Workflow Stages Executed: ${contract.workflowStages.join(' -> ')}`,
      `Final Lifecycle State: ${lifecycle.currentState}`,
      `Final Outcome: ${lifecycle.outcome}`
    ]);

    const inferences: ReadonlyArray<string> = Object.freeze([
      `Pattern Classification: [${candidateType}] derived from verified workflow execution.`,
      `Reusability Inference: High confidence organizational knowledge candidate for Role [${assignment.requiredRole}] and Capabilities [${assignment.requiredCapabilities.join(', ')}].`
    ]);

    const confidenceFactors: ReadonlyArray<ConfidenceFactor> = Object.freeze([
      'LIFECYCLE_COMPLETED_SUCCESS',
      'EXACT_ROLE_MATCH',
      'EXACT_CAPABILITY_VERIFIED',
      'STRICT_POLICY_PASSED',
      'DETERMINISTIC_FACTORY_CREATED'
    ]);

    const evidenceReferences: ReadonlyArray<string> = Object.freeze([
      contract.taskId,
      assignment.assignmentId,
      lifecycle.lifecycleId
    ]);

    const extractedCapabilities: ReadonlyArray<CapabilityType> = Object.freeze([
      ...assignment.requiredCapabilities
    ]);

    const extractedRoles: ReadonlyArray<string> = Object.freeze([
      assignment.requiredRole
    ]);

    const candidate: KnowledgeCandidate = Object.freeze({
      candidateId,
      taskId: contract.taskId,
      lifecycleId: lifecycle.lifecycleId,
      sourceAssignmentId: assignment.assignmentId,
      candidateType,
      confidence: 1.0,
      confidenceFactors,
      facts,
      inferences,
      extractedCapabilities,
      extractedRoles,
      evidenceReferences,
      createdAt: timestamp
    });

    return candidate;
  }

  private static determineCandidateType(intent: string): CandidateType {
    switch (intent) {
      case 'IMPLEMENTATION':
      case 'HOTFIX':
        return 'IMPLEMENTATION_PATTERN';
      case 'REVIEW':
        return 'REVIEW_PATTERN';
      case 'AUDIT':
        return 'AUDIT_PATTERN';
      case 'DESIGN':
      case 'PLANNING':
        return 'WORKFLOW_PATTERN';
      default:
        return 'BEST_PRACTICE';
    }
  }

  private static generateDeterministicCandidateId(taskId: string, lifecycleId: string, timestamp: string): string {
    let hash = 0;
    const str = `${taskId}:${lifecycleId}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `KC-${positiveHash}`;
  }
}
