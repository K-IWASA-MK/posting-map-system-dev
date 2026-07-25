/**
 * AIOS Employee Memory Foundation
 * Memory Access Guard Implementation (Read-Only Protection)
 */

import { IMemoryAccessGuard } from './contract/IEmployeeMemory';
import { MemoryAccessPurpose } from './models/EmployeeMemoryModels';

export class MemoryAccessGuard implements IMemoryAccessGuard {
  private authorizedRuntimes = new Set([
    'ExecutionRuntime',
    'KnowledgeRuntime',
    'ObservabilityEngine',
    'AuditLogger',
    'EmployeeMemoryRuntimeEngine',
  ]);

  public validateAccess(
    memoryId: string,
    requestingRuntime: string,
    accessPurpose: MemoryAccessPurpose
  ): { allowed: boolean; reason?: string } {
    if (!this.authorizedRuntimes.has(requestingRuntime)) {
      return {
        allowed: false,
        reason: `[Memory Access Guard Block] Runtime '${requestingRuntime}' is NOT authorized to access Memory. Direct access BLOCKED.`,
      };
    }

    if (!accessPurpose) {
      return {
        allowed: false,
        reason: '[Memory Access Guard Block] Access purpose must be explicitly specified (Additional Requirement 2).',
      };
    }

    return { allowed: true };
  }
}
