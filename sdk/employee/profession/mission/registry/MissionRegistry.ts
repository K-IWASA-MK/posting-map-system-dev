/**
 * MissionRegistry.ts
 * 
 * Pure Registry for Employee Missions (CRUD ONLY)
 */

import { EmployeeMission } from '../types/EmployeeMission';

export class MissionRegistry {
  private static missions: Map<string, EmployeeMission> = new Map();

  public static register(mission: EmployeeMission): void {
    this.missions.set(mission.missionId.getValue(), mission);
  }

  public static find(missionId: string): EmployeeMission | undefined {
    return this.missions.get(missionId.toUpperCase());
  }

  public static remove(missionId: string): boolean {
    return this.missions.delete(missionId.toUpperCase());
  }

  public static getAll(): EmployeeMission[] {
    return Array.from(this.missions.values());
  }

  public static clear(): void {
    this.missions.clear();
  }
}
