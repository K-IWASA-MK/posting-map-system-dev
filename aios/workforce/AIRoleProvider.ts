import { AIRole } from './AIRole';
import { AIRoleRequest } from './AIRoleRequest';
import { AIRoleResponse } from './AIRoleResponse';

export interface AIRoleProvider {
  registerRole(request: AIRoleRequest): AIRoleResponse;
  getRole(roleId: string): AIRoleResponse;
  listRoles(): readonly AIRole[];
}
