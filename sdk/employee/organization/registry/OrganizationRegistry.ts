/**
 * OrganizationRegistry.ts
 * 
 * Pure Registry for Employee Organizations (CRUD ONLY)
 */

import { EmployeeOrganization } from '../types/EmployeeOrganization';

export class OrganizationRegistry {
  private static organizations: Map<string, EmployeeOrganization> = new Map();

  public static register(org: EmployeeOrganization): void {
    this.organizations.set(org.organizationId.getValue(), org);
  }

  public static find(orgId: string): EmployeeOrganization | undefined {
    return this.organizations.get(orgId);
  }

  public static remove(orgId: string): boolean {
    return this.organizations.delete(orgId);
  }

  public static getAll(): EmployeeOrganization[] {
    return Array.from(this.organizations.values());
  }

  public static clear(): void {
    this.organizations.clear();
  }
}
