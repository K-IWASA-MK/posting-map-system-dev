/**
 * DomainRegistry.ts
 * 
 * Pure Registry for Employee Domains (CRUD ONLY)
 */

import { EmployeeDomain } from '../types/EmployeeDomain';

export class DomainRegistry {
  private static domains: Map<string, EmployeeDomain> = new Map();

  public static register(domain: EmployeeDomain): void {
    this.domains.set(domain.domainId.getValue(), domain);
  }

  public static find(domainId: string): EmployeeDomain | undefined {
    return this.domains.get(domainId.toUpperCase());
  }

  public static remove(domainId: string): boolean {
    return this.domains.delete(domainId.toUpperCase());
  }

  public static getAll(): EmployeeDomain[] {
    return Array.from(this.domains.values());
  }

  public static clear(): void {
    this.domains.clear();
  }
}
