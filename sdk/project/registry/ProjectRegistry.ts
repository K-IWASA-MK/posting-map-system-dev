/**
 * ProjectRegistry.ts
 * 
 * Pure Registry for Client ProjectProfiles (register, find, remove, getAll, clear)
 */

import { ProjectProfile } from '../types/ProjectProfile';

export class ProjectRegistry {
  private static projects: Map<string, ProjectProfile> = new Map();

  public static register(profile: ProjectProfile): void {
    const key = profile.projectId.getValue();
    this.projects.set(key, profile);
  }

  public static find(projectId: string): ProjectProfile | undefined {
    return this.projects.get(projectId.trim().toUpperCase());
  }

  public static remove(projectId: string): boolean {
    return this.projects.delete(projectId.trim().toUpperCase());
  }

  public static getAll(): ProjectProfile[] {
    return Array.from(this.projects.values());
  }

  public static clear(): void {
    this.projects.clear();
  }
}
