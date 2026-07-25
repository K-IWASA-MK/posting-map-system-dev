/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Tool Permission Guard
 */

import { IToolPermissionGuard } from '../contract/EmployeeGovernanceContract';
import { ToolPermission } from '../models/EmployeeDomainModels';

export class ToolPermissionGuard implements IToolPermissionGuard {
  public validateToolUsage(
    permission: ToolPermission,
    toolName: string,
    isCodeModification: boolean
  ): { allowed: boolean; reason?: string } {
    // 1. Check Authority Level for Code Modification
    if (isCodeModification && permission.authorityLevel !== 'MODIFY') {
      return {
        allowed: false,
        reason: `[Authority Level Block] Code modification requires 'MODIFY' authority level. Current level is '${permission.authorityLevel}'.`,
      };
    }

    // 2. Check if Tool is Whitelisted
    if (!permission.allowedTools.includes(toolName)) {
      return {
        allowed: false,
        reason: `[Tool Permission Block] Tool '${toolName}' is not in allowedTools whitelist.`,
      };
    }

    return { allowed: true };
  }
}
