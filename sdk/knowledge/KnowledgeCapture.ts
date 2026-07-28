/**
 * KnowledgeCapture.ts
 * 
 * AIOS Knowledge Capture Foundation
 * 
 * Single official entry point for extracting immutable KnowledgeCandidates from verified task lifecycles.
 * 
 * Foundation Rules:
 * - Stateless: Class contains no instance or mutable module state.
 * - Immutable: All returned KnowledgeCandidate objects are completely frozen.
 * - Deterministic: Pure function execution with no unseeded random or internal clock side-effects.
 * - Side Effect Free: No DB write, Vector DB insertion, Embedding generation, or LLM invocation.
 */

import { TaskContract } from '../gateway';
import { AssignmentContract } from '../dispatcher';
import { LifecycleRecord } from '../lifecycle';
import { CapturePolicy, CapturePolicyResolver } from './domain/CapturePolicy';
import { CaptureValidator } from './domain/CaptureValidator';
import { KnowledgeExtractor } from './domain/KnowledgeExtractor';
import { KnowledgeCandidate } from './models/KnowledgeCandidateModels';

export class KnowledgeCapture {
  /**
   * Deterministically extracts a KnowledgeCandidate from a verified lifecycle.
   * Returns null if policy conditions (e.g. COMPLETED + SUCCESS) are not met.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static capture(
    lifecycle: LifecycleRecord,
    assignment: AssignmentContract,
    contract: TaskContract,
    policy?: CapturePolicy,
    timestamp?: string
  ): KnowledgeCandidate | null {
    if (!lifecycle || !assignment || !contract) {
      throw new Error('[KnowledgeCapture] Request rejected: lifecycle, assignment, and contract objects are all required.');
    }

    const effectivePolicy = policy || CapturePolicyResolver.getDefaultPolicy();
    const valResult = CaptureValidator.validateCapture(lifecycle, effectivePolicy);

    if (!valResult.valid) {
      return null;
    }

    const effectiveTimestamp = timestamp || lifecycle.transitionedAt || '2026-07-29T00:00:00.000Z';
    return KnowledgeExtractor.extractCandidate(lifecycle, assignment, contract, effectiveTimestamp);
  }
}
