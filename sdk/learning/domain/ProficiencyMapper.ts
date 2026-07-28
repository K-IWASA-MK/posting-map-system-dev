/**
 * ProficiencyMapper.ts
 * 
 * AIOS Proficiency Level Mapper
 * Deterministic, stateless mapping from learningScore (0.0 to 100.0) to ProficiencyLevel.
 */

export type ProficiencyLevel =
  | 'NOVICE'
  | 'COMPETENT'
  | 'PROFICIENT'
  | 'EXPERT'
  | 'MASTER';

export class ProficiencyMapper {
  /**
   * Maps a learning score (0.0 - 100.0) to a ProficiencyLevel.
   * Pure function, Stateless, Deterministic.
   */
  public static mapScoreToLevel(score: number): ProficiencyLevel {
    if (score >= 91) return 'MASTER';
    if (score >= 76) return 'EXPERT';
    if (score >= 51) return 'PROFICIENT';
    if (score >= 26) return 'COMPETENT';
    return 'NOVICE';
  }
}
