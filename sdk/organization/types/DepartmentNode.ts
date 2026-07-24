import { OrgHierarchyLevel } from './OrgHierarchyLevel';
import { OrgHealth } from './OrgHealth';

export interface DepartmentNode {
  nodeId: string;
  name: string;
  level: OrgHierarchyLevel;
  parentNodeId?: string;
  supervisorEmployeeId?: string;
  memberEmployeeIds: string[];
  health: OrgHealth;
}
