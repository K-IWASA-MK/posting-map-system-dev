/**
 * AIOS Employee Memory Foundation
 * Memory Source Validator Implementation
 */

import { IMemorySourceValidator } from './contract/IEmployeeMemory';
import { MemorySourceType } from './models/EmployeeMemoryModels';

export class MemorySourceValidator implements IMemorySourceValidator {
  public validateSource(
    sourceType: MemorySourceType,
    sourceData: any
  ): { valid: boolean; reason?: string } {
    if (!sourceData) {
      return { valid: false, reason: '[Memory Validator Block] Source data cannot be null or undefined.' };
    }

    switch (sourceType) {
      case 'EXECUTION_RESULT':
        if (sourceData.status !== 'VERIFIED') {
          return {
            valid: false,
            reason: `[Memory Validator Block] EXECUTION_RESULT Memory requires status 'VERIFIED'. Got status '${sourceData.status}'.`,
          };
        }
        break;

      case 'WORKFLOW_HISTORY':
        if (sourceData.status !== 'COMPLETED') {
          return {
            valid: false,
            reason: `[Memory Validator Block] WORKFLOW_HISTORY Memory requires status 'COMPLETED'. Got status '${sourceData.status}'.`,
          };
        }
        break;

      case 'LEARNING_HISTORY':
        if (sourceData.status !== 'APPROVED') {
          return {
            valid: false,
            reason: `[Memory Validator Block] LEARNING_HISTORY Memory requires status 'APPROVED'. Got status '${sourceData.status}'.`,
          };
        }
        break;

      case 'COMMUNICATION_HISTORY':
        if (sourceData.audited !== true && sourceData.status !== 'APPROVED') {
          return {
            valid: false,
            reason: '[Memory Validator Block] COMMUNICATION_HISTORY Memory requires audited status.',
          };
        }
        break;

      default:
        return { valid: false, reason: `[Memory Validator Block] Unknown MemorySourceType '${sourceType}'.` };
    }

    return { valid: true };
  }
}
