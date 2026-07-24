import { DelegationScope } from '../types/DelegationScope';
import { UnauthorizedDelegationException } from '../exceptions/AIOrganizationExceptions';

export interface DelegationRecord {
  supervisorId: string;
  targetEmployeeId: string;
  scope: DelegationScope;
  grantedAt: string;
}

export class SupervisorAIEngine {
  private delegations: Map<string, DelegationRecord> = new Map();
  private interventionCount: number = 0;

  public delegateAuthority(supervisorId: string, targetEmployeeId: string, scope: DelegationScope): DelegationRecord {
    const recordId = `${supervisorId}:${targetEmployeeId}:${scope}`;
    const record: DelegationRecord = {
      supervisorId,
      targetEmployeeId,
      scope,
      grantedAt: new Date().toISOString()
    };
    this.delegations.set(recordId, record);
    return record;
  }

  public verifyAuthority(supervisorId: string, targetEmployeeId: string, scope: DelegationScope): boolean {
    const recordId = `${supervisorId}:${targetEmployeeId}:${scope}`;
    if (!this.delegations.has(recordId)) {
      throw new UnauthorizedDelegationException(`Employee '${targetEmployeeId}' does not have delegated authority for scope '${scope}' from Supervisor '${supervisorId}'.`);
    }
    return true;
  }

  public intervene(supervisorId: string, targetEmployeeId: string, action: string): boolean {
    console.log(`[Supervisor AI] Supervisor '${supervisorId}' intervened on Agent '${targetEmployeeId}'. Action: ${action}`);
    this.interventionCount++;
    return true;
  }

  public getInterventionCount(): number {
    return this.interventionCount;
  }

  public getDelegationCount(): number {
    return this.delegations.size;
  }
}
