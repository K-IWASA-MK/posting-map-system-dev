/**
 * TaskIntakeRequestValidator.ts
 * 
 * AIOS Task Intake Request Validator
 * 
 * 外部業務アプリケーションからのTaskIntakeRequestの構造・型・必須項目・
 * ISOタイムスタンプ完全性・Capability型妥当性を事前検証する。
 */

import { VerificationCapabilityType } from '../../verification';
import { ExecutionTaskPriority } from '../ExecutionTaskModel';
import { TaskIntakeRequest } from './TaskIntakeRequestModel';

export interface TaskIntakeValidationResult {
  readonly valid: boolean;
  readonly reason?: string;
}

export class TaskIntakeRequestValidator {
  /**
   * TaskIntakeRequestオブジェクトの型・完全性を検証する
   */
  static validateRequest(request: unknown): TaskIntakeValidationResult {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest must be a non-null object' });
    }

    const req = request as Record<string, any>;

    // 1. Check requestId
    if (!req.requestId || typeof req.requestId !== 'string' || req.requestId.trim() === '') {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest requires a non-empty string requestId' });
    }

    // 2. Check sourceApplication
    if (!req.sourceApplication || typeof req.sourceApplication !== 'string' || req.sourceApplication.trim() === '') {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest requires a non-empty string sourceApplication' });
    }

    // 3. Check title
    if (!req.title || typeof req.title !== 'string' || req.title.trim() === '') {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest requires a non-empty string title' });
    }

    // 4. Check description
    if (typeof req.description !== 'string') {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest description must be a string' });
    }

    // 5. Check priority
    const validPriorities = Object.values(ExecutionTaskPriority);
    if (!req.priority || !validPriorities.includes(req.priority as ExecutionTaskPriority)) {
      return Object.freeze({
        valid: false,
        reason: `TaskIntakeRequest priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    // 6. Check requiredCapabilities
    if (!Array.isArray(req.requiredCapabilities)) {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest requiredCapabilities must be an array' });
    }

    const validCapabilities = Object.values(VerificationCapabilityType);
    for (const cap of req.requiredCapabilities) {
      if (!validCapabilities.includes(cap as VerificationCapabilityType)) {
        return Object.freeze({ valid: false, reason: `Invalid VerificationCapabilityType in request: ${cap}` });
      }
    }

    // 7. Check requestedAt ISO timestamp
    if (!req.requestedAt || typeof req.requestedAt !== 'string' || isNaN(Date.parse(req.requestedAt))) {
      return Object.freeze({ valid: false, reason: 'TaskIntakeRequest requires a valid ISO string requestedAt timestamp' });
    }

    return Object.freeze({ valid: true });
  }
}
