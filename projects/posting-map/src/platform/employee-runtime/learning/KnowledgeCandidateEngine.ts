/**
 * AIOS Employee Learning Foundation
 * Knowledge Candidate Extraction Engine Implementation
 */

import { ResultRecord } from '../result/models/EmployeeResultModels';
import { IKnowledgeCandidateEngine } from './contract/ILearningRegistry';
import { KnowledgeCandidate, LearningRecord } from './models/EmployeeLearningModels';

export class KnowledgeCandidateEngine implements IKnowledgeCandidateEngine {
  public extractCandidate(
    result: ResultRecord,
    pattern: string,
    confidence: number
  ): LearningRecord {
    // 1. Result Status Check (Strict Guard: VERIFIED Result ONLY)
    if (result.status !== 'VERIFIED') {
      throw new Error(
        `[Learning Candidate Block] Cannot extract Knowledge Candidate from Result '${result.resultId}' with status '${result.status}'. Only 'VERIFIED' Results are eligible.`
      );
    }

    const learningId = `LRN-${result.resultId}-${Date.now()}`;
    const candidate: KnowledgeCandidate = Object.freeze({
      pattern: pattern,
      evidence: `Result:${result.resultId}|Execution:${result.executionId}`,
      confidence: Math.min(Math.max(confidence, 0.0), 1.0),
      status: 'CREATED',
    });

    const record: LearningRecord = {
      learningId: learningId,
      sourceResultId: result.resultId,
      employeeId: result.employeeId,
      taskId: result.taskId,
      candidate: candidate,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };

    return record;
  }
}
