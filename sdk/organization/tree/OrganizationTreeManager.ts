import { DepartmentNode } from '../types/DepartmentNode';
import { OrgHierarchyLevel } from '../types/OrgHierarchyLevel';
import { OrgHealth } from '../types/OrgHealth';
import { AIOrganizationPolicy } from '../policy/AIOrganizationPolicy';

export class OrganizationTreeManager {
  private nodes: Map<string, DepartmentNode> = new Map();

  public createNode(nodeId: string, name: string, level: OrgHierarchyLevel, parentNodeId?: string): DepartmentNode {
    const node: DepartmentNode = {
      nodeId,
      name,
      level,
      parentNodeId,
      memberEmployeeIds: [],
      health: OrgHealth.NORMAL
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  public addMemberToNode(nodeId: string, employeeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Organization node ${nodeId} not found.`);

    AIOrganizationPolicy.validateTeamSize(node.memberEmployeeIds.length);
    node.memberEmployeeIds.push(employeeId);
  }

  public assignSupervisor(nodeId: string, supervisorEmployeeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Organization node ${nodeId} not found.`);
    node.supervisorEmployeeId = supervisorEmployeeId;
  }

  public getNode(nodeId: string): DepartmentNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): DepartmentNode[] {
    return Array.from(this.nodes.values());
  }
}
