/**
 * RoleResolver.ts
 * 
 * AIOS Task Dispatcher Role Resolver
 * Deterministically maps TaskContract intent to organizational requiredRole and evaluates Agent support.
 */

import { TaskContract } from '../../gateway';
import { AgentProfile } from '../models/AgentModels';

export class RoleResolver {
  /**
   * Deterministically resolves the required role for a given TaskContract.
   */
  public static resolveRequiredRole(contract: TaskContract): string {
    switch (contract.intent) {
      case 'IMPLEMENTATION':
      case 'DESIGN':
      case 'HOTFIX':
        return 'IMPLEMENTATION_ENGINEER';
      case 'RESEARCH':
      case 'QUESTION':
        return 'RESEARCH_ANALYST';
      case 'REVIEW':
        return 'REVIEW_ENGINEER';
      case 'AUDIT':
        return 'AUDIT_OFFICER';
      case 'PLANNING':
        return 'PLANNING_LEAD';
      default:
        return 'IMPLEMENTATION_ENGINEER';
    }
  }

  /**
   * Checks if an agent profile explicitly supports a required role.
   */
  public static isRoleSupported(agent: AgentProfile, role: string): boolean {
    return agent.supportedRoles.includes(role);
  }
}
