/**
 * ConstitutionRuntimeContext.ts
 * 
 * Immutable execution context passed from Runtime to ConstitutionRuntimeGate.
 */

import { CandidateItem } from '../../constitution/enforcement/ConstitutionEnforcement';

export interface ConstitutionRuntimeContext {
  readonly projectId: string;
  readonly employeeId: string;
  readonly taskId: string;
  readonly candidateItems: readonly CandidateItem[];
}

export class ConstitutionRuntimeContextFactory {
  public static create(
    projectId: string,
    employeeId: string,
    taskId: string,
    items: CandidateItem[]
  ): ConstitutionRuntimeContext {
    return Object.freeze({
      projectId,
      employeeId,
      taskId,
      candidateItems: Object.freeze([...items])
    });
  }
}
