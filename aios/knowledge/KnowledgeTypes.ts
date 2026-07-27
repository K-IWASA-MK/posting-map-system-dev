import { StructuredReflection } from '../learning/ReflectionTypes';

export interface KnowledgeCandidate {
  readonly candidateId: string;
  readonly targetScope: "PROJECT" | "GLOBAL";
  readonly projectId?: string;
  readonly ruleTitle: string;
  readonly reflection: StructuredReflection;
  readonly evidenceTaskIds: readonly string[]; // Diverse task IDs
  readonly evidenceCount: number;
  readonly confidence: number;
  readonly status: "PENDING_VALIDATION" | "APPROVED_FOR_PROJECT" | "APPROVED_FOR_GLOBAL" | "REJECTED";
}
