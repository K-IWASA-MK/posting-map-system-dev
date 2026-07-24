import { AIOrganizationPolicyViolationException } from '../exceptions/AIOrganizationExceptions';

export class AIOrganizationPolicy {
  public static readonly MAX_TEAM_SIZE = 10;
  public static readonly MAX_DIRECT_REPORTS = 7;
  public static readonly MAX_DELEGATION_DEPTH = 3;
  public static readonly ALLOW_CROSS_TEAM_DELEGATION = true;

  public static validateTeamSize(currentMembers: number): void {
    if (currentMembers >= AIOrganizationPolicy.MAX_TEAM_SIZE) {
      throw new AIOrganizationPolicyViolationException(`Team size limit of ${AIOrganizationPolicy.MAX_TEAM_SIZE} reached.`);
    }
  }
}
