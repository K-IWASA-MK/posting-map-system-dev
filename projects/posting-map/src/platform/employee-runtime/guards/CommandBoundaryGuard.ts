/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Command Boundary Guard
 */

import { ICommandBoundaryGuard } from '../contract/EmployeeGovernanceContract';
import { CommandScope } from '../models/EmployeeDomainModels';

export class CommandBoundaryGuard implements ICommandBoundaryGuard {
  public validateAction(
    scope: CommandScope,
    action: string
  ): { allowed: boolean; reason?: string } {
    // 1. Check if action is in forbiddenActions list
    if (scope.forbiddenActions.includes(action)) {
      return {
        allowed: false,
        reason: `[Command Boundary Block] Action '${action}' is explicitly forbidden.`,
      };
    }

    // 2. Check if action is in allowedActions list
    if (!scope.allowedActions.includes(action)) {
      return {
        allowed: false,
        reason: `[Command Boundary Block] Action '${action}' is not in allowedActions list. Must transition to WAITING_APPROVAL.`,
      };
    }

    return { allowed: true };
  }
}
