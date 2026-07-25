/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Tool Gate Implementation (Independent Validation)
 */

import { IToolGate } from './contract/IEmployeeEnforcement';
import { EnforcementRequest, GateResult } from './models/EmployeeEnforcementModels';

export class ToolGate implements IToolGate {
  public validateToolExecution(request: EnforcementRequest): { result: GateResult; reason?: string } {
    if (!request.toolName) {
      return { result: 'PASS' }; // No tool call requested for this enforcement step
    }

    const whitelist = request.allowedToolsWhitelist || [];

    if (!whitelist.includes(request.toolName)) {
      return {
        result: 'BLOCK',
        reason: `[Tool Gate Block] Tool '${request.toolName}' is NOT present in allowedTools whitelist [${whitelist.join(', ')}]. Direct API bypass or unapproved tool execution BLOCKED.`,
      };
    }

    return { result: 'PASS' };
  }
}
