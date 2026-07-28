/**
 * DepartmentRegistry.ts
 * 
 * Pure Registry for Employee Departments (CRUD ONLY)
 */

import { EmployeeDepartment } from '../types/EmployeeDepartment';

export class DepartmentRegistry {
  private static departments: Map<string, EmployeeDepartment> = new Map();

  public static register(department: EmployeeDepartment): void {
    this.departments.set(String(department.departmentId), department);
  }

  public static find(departmentId: string): EmployeeDepartment | undefined {
    return this.departments.get(departmentId);
  }

  public static remove(departmentId: string): boolean {
    return this.departments.delete(departmentId);
  }

  public static getAll(): EmployeeDepartment[] {
    return Array.from(this.departments.values());
  }

  public static clear(): void {
    this.departments.clear();
  }
}
