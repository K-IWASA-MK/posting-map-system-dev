/**
 * ProfessionRegistry.ts
 * 
 * Pure Registry for Employee Professions (CRUD ONLY)
 */

import { EmployeeProfession } from '../types/EmployeeProfession';

export class ProfessionRegistry {
  private static professions: Map<string, EmployeeProfession> = new Map();

  public static register(profession: EmployeeProfession): void {
    this.professions.set(profession.professionId.getValue(), profession);
  }

  public static find(professionId: string): EmployeeProfession | undefined {
    return this.professions.get(professionId.toUpperCase());
  }

  public static remove(professionId: string): boolean {
    return this.professions.delete(professionId.toUpperCase());
  }

  public static getAll(): EmployeeProfession[] {
    return Array.from(this.professions.values());
  }

  public static clear(): void {
    this.professions.clear();
  }
}
