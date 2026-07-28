/**
 * RoleRegistry.ts
 * 
 * Pure Registry for Employee Roles & Definitions (CRUD ONLY)
 */

export interface RoleDefinition {
  roleId: string;
  roleName: string;
  level: number;
  description: string;
}

export class RoleRegistry {
  private static roles: Map<string, RoleDefinition> = new Map();

  public static register(role: RoleDefinition): void {
    this.roles.set(role.roleId, role);
  }

  public static find(roleId: string): RoleDefinition | undefined {
    return this.roles.get(roleId);
  }

  public static remove(roleId: string): boolean {
    return this.roles.delete(roleId);
  }

  public static getAll(): RoleDefinition[] {
    return Array.from(this.roles.values());
  }

  public static clear(): void {
    this.roles.clear();
  }
}
