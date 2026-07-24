import { OrganizationTreeManager } from './tree/OrganizationTreeManager';
import { SupervisorAIEngine } from './supervision/SupervisorAIEngine';
import { OrganizationRecoveryManager } from './recovery/OrganizationRecoveryManager';
import { OrgHierarchyLevel } from './types/OrgHierarchyLevel';
import { DepartmentNode } from './types/DepartmentNode';
import { DelegationScope } from './types/DelegationScope';
import { OrganizationMetrics } from './types/OrganizationMetrics';

export class AIOrganizationManager {
  private static instance: AIOrganizationManager | null = null;
  private treeManager: OrganizationTreeManager;
  private supervisorEngine: SupervisorAIEngine;
  private recoveryManager: OrganizationRecoveryManager;

  private constructor() {
    this.treeManager = new OrganizationTreeManager();
    this.supervisorEngine = new SupervisorAIEngine();
    this.recoveryManager = new OrganizationRecoveryManager();
  }

  public static getInstance(): AIOrganizationManager {
    if (!AIOrganizationManager.instance) {
      AIOrganizationManager.instance = new AIOrganizationManager();
    }
    return AIOrganizationManager.instance;
  }

  public static resetInstance(): void {
    AIOrganizationManager.instance = null;
  }

  public createNode(nodeId: string, name: string, level: OrgHierarchyLevel, parentNodeId?: string): DepartmentNode {
    return this.treeManager.createNode(nodeId, name, level, parentNodeId);
  }

  public addMemberToNode(nodeId: string, employeeId: string): void {
    this.treeManager.addMemberToNode(nodeId, employeeId);
  }

  public assignSupervisor(nodeId: string, supervisorEmployeeId: string): void {
    this.treeManager.assignSupervisor(nodeId, supervisorEmployeeId);
  }

  public delegateAuthority(supervisorId: string, targetEmployeeId: string, scope: DelegationScope): void {
    this.supervisorEngine.delegateAuthority(supervisorId, targetEmployeeId, scope);
  }

  public verifyAuthority(supervisorId: string, targetEmployeeId: string, scope: DelegationScope): boolean {
    return this.supervisorEngine.verifyAuthority(supervisorId, targetEmployeeId, scope);
  }

  public intervene(supervisorId: string, targetEmployeeId: string, action: string): boolean {
    return this.supervisorEngine.intervene(supervisorId, targetEmployeeId, action);
  }

  public async recover(): Promise<boolean> {
    return await this.recoveryManager.performOrgRecoverySequence(this.treeManager);
  }

  public getMetrics(): OrganizationMetrics {
    const nodes = this.treeManager.getAllNodes();
    let empCount = 0;
    nodes.forEach(n => empCount += n.memberEmployeeIds.length);

    return {
      departmentCount: nodes.filter(n => n.level === OrgHierarchyLevel.DEPARTMENT).length,
      teamCount: nodes.filter(n => n.level === OrgHierarchyLevel.TEAM).length,
      supervisorCount: nodes.filter(n => !!n.supervisorEmployeeId).length,
      employeeCount: empCount,
      delegationCount: this.supervisorEngine.getDelegationCount(),
      interventionCount: this.supervisorEngine.getInterventionCount()
    };
  }
}
