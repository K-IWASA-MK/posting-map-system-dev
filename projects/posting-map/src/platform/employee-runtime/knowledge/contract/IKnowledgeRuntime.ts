/**
 * AIOS Knowledge Runtime Foundation
 * Abstraction Interfaces for Knowledge Access Guard, Query Engine, Context Provider, and Runtime Engine
 */

import { LearningRecord } from '../../learning/models/EmployeeLearningModels';
import {
  KnowledgeAccessRecord,
  KnowledgeContext,
  KnowledgeFilter,
  KnowledgeReference,
} from '../models/KnowledgeRuntimeModels';

export interface IKnowledgeAccessGuard {
  validateAccess(
    learning: LearningRecord | KnowledgeReference
  ): { allowed: boolean; reason?: string };
}

export interface IKnowledgeContextProvider {
  createContext(taskId: string, references: KnowledgeReference[]): KnowledgeContext;
}

export interface IKnowledgeRuntimeEngine {
  indexApprovedKnowledge(learning: LearningRecord): KnowledgeReference;
  createNewVersion(
    existingKnowledgeId: string,
    updatedLearning: LearningRecord
  ): KnowledgeReference;
  getKnowledge(knowledgeId: string): KnowledgeReference;
  query(filter?: KnowledgeFilter): KnowledgeReference[];
  findByPattern(pattern: string): KnowledgeReference[];
  createKnowledgeContext(
    taskId: string,
    employeeId: string,
    accessRequestId: string,
    filter?: KnowledgeFilter
  ): KnowledgeContext;
  getAuditLogs(knowledgeId?: string): KnowledgeAccessRecord[];
}
