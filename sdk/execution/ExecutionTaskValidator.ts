/**
 * ExecutionTaskValidator.ts
 * 
 * Execution Task Model バリデータ
 * 
 * タスク契約の完全性、列挙値整合性、および型構造を厳格に検証する。
 */

import { VerificationCapabilityType } from '../verification/VerificationCapabilityModel';
import {
  ExecutionTask,
  ExecutionTaskPriority,
  ExecutionTaskStatus
} from './ExecutionTaskModel';

export class ExecutionTaskValidator {
  /**
   * ExecutionTask オブジェクトが正当かを検証する
   */
  static validateTask(task: unknown): task is ExecutionTask {
    if (!task || typeof task !== 'object') {
      return false;
    }

    const t = task as Record<string, any>;

    if (typeof t.taskId !== 'string' || t.taskId.trim() === '') {
      return false;
    }

    if (typeof t.title !== 'string' || t.title.trim() === '') {
      return false;
    }

    if (typeof t.description !== 'string') {
      return false;
    }

    if (!Object.values(ExecutionTaskPriority).includes(t.priority)) {
      return false;
    }

    if (!Object.values(ExecutionTaskStatus).includes(t.status)) {
      return false;
    }

    if (t.assignedEmployeeId !== undefined && typeof t.assignedEmployeeId !== 'string') {
      return false;
    }

    if (!Array.isArray(t.requiredCapabilities)) {
      return false;
    }

    const validCapTypes = Object.values(VerificationCapabilityType);
    if (!t.requiredCapabilities.every((cap: any) => validCapTypes.includes(cap))) {
      return false;
    }

    if (typeof t.createdAt !== 'string' || Number.isNaN(Date.parse(t.createdAt))) {
      return false;
    }

    if (typeof t.updatedAt !== 'string' || Number.isNaN(Date.parse(t.updatedAt))) {
      return false;
    }

    if (t.metadata !== undefined && (typeof t.metadata !== 'object' || t.metadata === null)) {
      return false;
    }

    return true;
  }
}
