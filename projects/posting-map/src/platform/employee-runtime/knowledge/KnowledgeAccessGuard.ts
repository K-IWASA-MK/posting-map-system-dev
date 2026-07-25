/**
 * AIOS Knowledge Runtime Foundation
 * Knowledge Access Guard Implementation
 */

import { LearningRecord } from '../learning/models/EmployeeLearningModels';
import { IKnowledgeAccessGuard } from './contract/IKnowledgeRuntime';
import { KnowledgeReference } from './models/KnowledgeRuntimeModels';

export class KnowledgeAccessGuard implements IKnowledgeAccessGuard {
  public validateAccess(
    item: LearningRecord | KnowledgeReference
  ): { allowed: boolean; reason?: string } {
    if (item.status !== 'APPROVED') {
      return {
        allowed: false,
        reason: `[Knowledge Access Block] Item is in '${item.status}' status. Only 'APPROVED' Knowledge can be accessed or referenced.`,
      };
    }

    return { allowed: true };
  }
}
