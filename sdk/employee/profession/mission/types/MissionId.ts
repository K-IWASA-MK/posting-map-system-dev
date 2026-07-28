/**
 * MissionId.ts
 * 
 * Mission Identity Value Object & Pre-defined Standard Mission IDs
 */

export class MissionId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[MissionId] Mission ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: MissionId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): MissionId {
    return new MissionId(id);
  }

  // Pre-defined Standard Missions
  public static readonly MISSION_VERIFY_ADDRESS = 'MISSION_VERIFY_ADDRESS';
  public static readonly MISSION_BUILD_RUNTIME = 'MISSION_BUILD_RUNTIME';
  public static readonly MISSION_DEPLOY_SYSTEM = 'MISSION_DEPLOY_SYSTEM';
  public static readonly MISSION_VALIDATE_OUTPUT = 'MISSION_VALIDATE_OUTPUT';
  public static readonly MISSION_CREATE_DOCUMENT = 'MISSION_CREATE_DOCUMENT';
  public static readonly MISSION_GENERATE_VIDEO = 'MISSION_GENERATE_VIDEO';
  public static readonly MISSION_RESEARCH_REQUIREMENTS = 'MISSION_RESEARCH_REQUIREMENTS';
  public static readonly MISSION_AUDIT_SECURITY = 'MISSION_AUDIT_SECURITY';
}
