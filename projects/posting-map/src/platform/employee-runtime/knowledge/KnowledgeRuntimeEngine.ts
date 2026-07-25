/**
 * AIOS Knowledge Runtime Foundation
 * Knowledge Runtime Engine Implementation
 */

import { LearningRecord } from '../learning/models/EmployeeLearningModels';
import { KnowledgeAccessGuard } from './KnowledgeAccessGuard';
import { IKnowledgeRuntimeEngine } from './contract/IKnowledgeRuntime';
import {
  KnowledgeAccessRecord,
  KnowledgeContext,
  KnowledgeFilter,
  KnowledgeReference,
} from './models/KnowledgeRuntimeModels';

export class KnowledgeRuntimeEngine implements IKnowledgeRuntimeEngine {
  private knowledgeIndex: Map<string, KnowledgeReference> = new Map();
  private versionMap: Map<string, number> = new Map(); // Pattern -> Latest Version
  private auditLogs: KnowledgeAccessRecord[] = [];
  private guard = new KnowledgeAccessGuard();

  public indexApprovedKnowledge(learning: LearningRecord): KnowledgeReference {
    // 1. Guard Check (APPROVED Only)
    const accessRes = this.guard.validateAccess(learning);
    if (!accessRes.allowed) {
      throw new Error(accessRes.reason);
    }

    const knowledgeId = `KNOW-${learning.learningId}`;
    if (this.knowledgeIndex.has(knowledgeId)) {
      throw new Error(
        `[Knowledge Runtime Block] KnowledgeId '${knowledgeId}' already indexed. Direct overwrite forbidden.`
      );
    }

    const pattern = learning.candidate.pattern;
    const version = (this.versionMap.get(pattern) || 0) + 1;
    this.versionMap.set(pattern, version);

    const reference: KnowledgeReference = Object.freeze({
      knowledgeId: knowledgeId,
      sourceLearningId: learning.learningId,
      pattern: pattern,
      evidence: learning.candidate.evidence,
      confidence: learning.candidate.confidence,
      version: version,
      approvedAt: new Date().toISOString(),
      status: 'APPROVED',
    });

    this.knowledgeIndex.set(knowledgeId, reference);
    return reference;
  }

  public createNewVersion(
    existingKnowledgeId: string,
    updatedLearning: LearningRecord
  ): KnowledgeReference {
    const existing = this.getKnowledge(existingKnowledgeId);

    // Guard Check
    const accessRes = this.guard.validateAccess(updatedLearning);
    if (!accessRes.allowed) {
      throw new Error(accessRes.reason);
    }

    const newKnowledgeId = `KNOW-${updatedLearning.learningId}-v${existing.version + 1}`;
    if (this.knowledgeIndex.has(newKnowledgeId)) {
      throw new Error(`[Knowledge Runtime Block] Version KnowledgeId '${newKnowledgeId}' already exists.`);
    }

    const newVersion = existing.version + 1;
    this.versionMap.set(existing.pattern, newVersion);

    const newReference: KnowledgeReference = Object.freeze({
      knowledgeId: newKnowledgeId,
      sourceLearningId: updatedLearning.learningId,
      pattern: existing.pattern,
      evidence: updatedLearning.candidate.evidence,
      confidence: updatedLearning.candidate.confidence,
      version: newVersion,
      approvedAt: new Date().toISOString(),
      status: 'APPROVED',
    });

    this.knowledgeIndex.set(newKnowledgeId, newReference);
    return newReference;
  }

  public getKnowledge(knowledgeId: string): KnowledgeReference {
    const ref = this.knowledgeIndex.get(knowledgeId);
    if (!ref) {
      throw new Error(`[Knowledge Runtime Block] KnowledgeId '${knowledgeId}' not found.`);
    }
    return ref;
  }

  public query(filter?: KnowledgeFilter): KnowledgeReference[] {
    let list = Array.from(this.knowledgeIndex.values());
    if (!filter) return list;

    if (filter.pattern) list = list.filter((k) => k.pattern === filter.pattern);
    if (filter.version) list = list.filter((k) => k.version === filter.version);

    return list;
  }

  public findByPattern(pattern: string): KnowledgeReference[] {
    return this.query({ pattern: pattern });
  }

  public createKnowledgeContext(
    taskId: string,
    employeeId: string,
    accessRequestId: string,
    filter?: KnowledgeFilter
  ): KnowledgeContext {
    const refs = this.query(filter);

    const contextId = `CTX-${taskId}-${Date.now()}`;
    const frozenContext: KnowledgeContext = Object.freeze({
      contextId: contextId,
      taskId: taskId,
      references: Object.freeze(refs.map((r) => Object.freeze({ ...r }))),
      generatedAt: new Date().toISOString(),
    });

    // Log Access Audit
    this.auditLogs.push(
      Object.freeze({
        accessId: `ACC-${Date.now()}`,
        knowledgeId: refs.map((r) => r.knowledgeId).join(',') || 'NONE',
        accessRequestId: accessRequestId,
        taskId: taskId,
        employeeId: employeeId,
        resultStatus: 'ALLOWED',
        timestamp: new Date().toISOString(),
      })
    );

    return frozenContext;
  }

  public getAuditLogs(knowledgeId?: string): KnowledgeAccessRecord[] {
    if (knowledgeId) {
      return this.auditLogs.filter((log) => log.knowledgeId.includes(knowledgeId));
    }
    return [...this.auditLogs];
  }
}
