/**
 * SkillLevel.ts
 * 
 * Proficiency Skill Level Enum & Numeric Mapping
 */

export enum SkillLevel {
  NOVICE = 'NOVICE',
  COMPETENT = 'COMPETENT',
  PROFICIENT = 'PROFICIENT',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER'
}

export const SkillLevelValueMap: Record<SkillLevel, number> = {
  [SkillLevel.NOVICE]: 1,
  [SkillLevel.COMPETENT]: 2,
  [SkillLevel.PROFICIENT]: 3,
  [SkillLevel.EXPERT]: 4,
  [SkillLevel.MASTER]: 5
};
