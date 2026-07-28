/**
 * SkillRegistry.ts
 * 
 * Pure Registry for Employee Skill Profiles (CRUD ONLY)
 */

import { SkillProfile } from '../types/SkillProfile';

export class SkillRegistry {
  private static skills: Map<string, SkillProfile> = new Map();

  public static register(skill: SkillProfile): void {
    this.skills.set(skill.skillId.toUpperCase(), skill);
  }

  public static find(skillId: string): SkillProfile | undefined {
    return this.skills.get(skillId.toUpperCase());
  }

  public static remove(skillId: string): boolean {
    return this.skills.delete(skillId.toUpperCase());
  }

  public static getAll(): SkillProfile[] {
    return Array.from(this.skills.values());
  }

  public static clear(): void {
    this.skills.clear();
  }
}
