import { KnowledgeCandidate } from './KnowledgeTypes';
import { PersonalLesson } from '../learning/ReflectionTypes';

export interface ValidationEvaluationResult {
  readonly approved: boolean;
  readonly targetScope: "PROJECT" | "GLOBAL" | "PERSONAL";
  readonly reason: string;
  readonly updatedCandidate?: KnowledgeCandidate;
}

export class KnowledgeValidator {
  /**
   * Evaluates a PersonalLesson or KnowledgeCandidate against evidence count,
   * evidence diversity (different task IDs), and confidence thresholds.
   */
  public static evaluateCandidate(candidate: KnowledgeCandidate): ValidationEvaluationResult {
    const uniqueTasks = new Set(candidate.evidenceTaskIds);

    // Global Knowledge Promotion Rule
    if (
      candidate.evidenceCount >= 10 &&
      uniqueTasks.size >= 5 &&
      candidate.confidence >= 0.95
    ) {
      return {
        approved: true,
        targetScope: "GLOBAL",
        reason: `Promoted to GLOBAL knowledge: Evidence count ${candidate.evidenceCount}, Unique tasks ${uniqueTasks.size}, Confidence ${candidate.confidence}`,
        updatedCandidate: {
          ...candidate,
          targetScope: "GLOBAL",
          status: "APPROVED_FOR_GLOBAL"
        }
      };
    }

    // Project Knowledge Promotion Rule
    if (
      candidate.evidenceCount >= 3 &&
      uniqueTasks.size >= 3 &&
      candidate.confidence >= 0.85
    ) {
      return {
        approved: true,
        targetScope: "PROJECT",
        reason: `Promoted to PROJECT knowledge: Evidence count ${candidate.evidenceCount}, Unique tasks ${uniqueTasks.size}, Confidence ${candidate.confidence}`,
        updatedCandidate: {
          ...candidate,
          targetScope: "PROJECT",
          status: "APPROVED_FOR_PROJECT"
        }
      };
    }

    return {
      approved: false,
      targetScope: "PERSONAL",
      reason: `Retained at PERSONAL level: Insufficient evidence diversity (${uniqueTasks.size}/3) or confidence (${candidate.confidence}/0.85)`
    };
  }

  /**
   * Constructs a KnowledgeCandidate from a PersonalLesson.
   */
  public static fromPersonalLesson(lesson: PersonalLesson, projectId: string): KnowledgeCandidate {
    return {
      candidateId: `KCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetScope: "PROJECT",
      projectId,
      ruleTitle: lesson.reflection.futureRule,
      reflection: lesson.reflection,
      evidenceTaskIds: lesson.evidenceTaskIds,
      evidenceCount: lesson.evidenceCount,
      confidence: lesson.confidence,
      status: "PENDING_VALIDATION"
    };
  }
}
