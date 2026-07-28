/**
 * ProfessionResolver.ts
 * 
 * Professional Expertise, Mission Coverage, and Domain Suitability Resolver
 */

import { ProfessionAssignment } from './types/ProfessionAssignment';

export interface ProfessionEvaluationCriteria {
  requiredProfessionId?: string;
  requiredMissionIds?: string[];
  requiredDomainIds?: string[];
  requiredSkillIds?: string[];
}

export interface ProfessionMatchResult {
  professionScore: number;
  missionScore: number;
  domainScore: number;
  skillScore: number;
  compositeScore: number; // Pure expertise match score (0.0 to 1.0)
}

export class ProfessionResolver {
  public static evaluateMatch(
    assignment: ProfessionAssignment | undefined,
    criteria: ProfessionEvaluationCriteria
  ): ProfessionMatchResult {
    if (!assignment) {
      return { professionScore: 0, missionScore: 0, domainScore: 0, skillScore: 0, compositeScore: 0 };
    }

    // 1. Profession Match
    let professionScore = 1.0;
    if (criteria.requiredProfessionId) {
      professionScore = assignment.profession.professionId.getValue() === criteria.requiredProfessionId.toUpperCase() ? 1.0 : 0.0;
    }

    // 2. Mission Match
    let missionScore = 1.0;
    if (criteria.requiredMissionIds && criteria.requiredMissionIds.length > 0) {
      const matched = criteria.requiredMissionIds.filter((req) =>
        assignment.missions.some((m) => m.missionId.getValue() === req.toUpperCase())
      ).length;
      missionScore = matched / criteria.requiredMissionIds.length;
    }

    // 3. Domain Match (supports hierarchy)
    let domainScore = 1.0;
    if (criteria.requiredDomainIds && criteria.requiredDomainIds.length > 0) {
      const matched = criteria.requiredDomainIds.filter((req) =>
        assignment.domains.some((d) => d.domainId.matches(req))
      ).length;
      domainScore = matched / criteria.requiredDomainIds.length;
    }

    // 4. Skill Match
    let skillScore = 1.0;
    if (criteria.requiredSkillIds && criteria.requiredSkillIds.length > 0) {
      const matched = criteria.requiredSkillIds.filter((req) =>
        assignment.skills.some((s) => s.skillId.toUpperCase() === req.toUpperCase())
      ).length;
      skillScore = matched / criteria.requiredSkillIds.length;
    }

    const compositeScore = professionScore * 0.35 + missionScore * 0.35 + domainScore * 0.2 + skillScore * 0.1;

    return {
      professionScore,
      missionScore,
      domainScore,
      skillScore,
      compositeScore
    };
  }
}
