/**
 * SkillProfile.ts
 * 
 * Skill Profile Model with Meta-fields (Confidence, Last Validated, Evidence)
 */

import { SkillLevel } from './SkillLevel';

export interface SkillProfile {
  skillId: string;
  skillName: string;
  category: string;
  level: SkillLevel;
  confidence?: number; // 0.0 to 1.0
  lastValidated?: string;
  evidence?: string[];
}
