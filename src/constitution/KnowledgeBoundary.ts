/**
 * KnowledgeBoundary.ts
 * 
 * Defines allowable vs forbidden knowledge retention categories for AIOS Platform
 * as dictated by Principle 003 (Knowledge Boundary Principle) and Principle 004 (No Artifact Retention Principle).
 */

export type RetainableKnowledgeCategory = 
  | 'SKILL'
  | 'KNOWLEDGE'
  | 'EXPERIENCE'
  | 'BEST_PRACTICE'
  | 'METRICS'
  | 'QUALITY_IMPROVEMENT';

export type ForbiddenKnowledgeCategory = 
  | 'PROJECT_FILES'
  | 'PROJECT_DOCUMENTS'
  | 'PROJECT_DATABASE'
  | 'PROJECT_SECRETS'
  | 'RUNTIME_STATE';

export class KnowledgeBoundary {
  public static readonly RETAINABLE_CATEGORIES: readonly RetainableKnowledgeCategory[] = Object.freeze([
    'SKILL',
    'KNOWLEDGE',
    'EXPERIENCE',
    'BEST_PRACTICE',
    'METRICS',
    'QUALITY_IMPROVEMENT'
  ]);

  public static readonly FORBIDDEN_CATEGORIES: readonly ForbiddenKnowledgeCategory[] = Object.freeze([
    'PROJECT_FILES',
    'PROJECT_DOCUMENTS',
    'PROJECT_DATABASE',
    'PROJECT_SECRETS',
    'RUNTIME_STATE'
  ]);

  public static isRetainableCategory(category: string): category is RetainableKnowledgeCategory {
    return KnowledgeBoundary.RETAINABLE_CATEGORIES.includes(category as RetainableKnowledgeCategory);
  }

  public static isForbiddenCategory(category: string): category is ForbiddenKnowledgeCategory {
    return KnowledgeBoundary.FORBIDDEN_CATEGORIES.includes(category as ForbiddenKnowledgeCategory);
  }

  public static evaluateCategory(category: string): { allowed: boolean; reason: string } {
    if (KnowledgeBoundary.isRetainableCategory(category)) {
      return {
        allowed: true,
        reason: `Category '${category}' is a valid retainable AIOS platform knowledge asset.`
      };
    }
    if (KnowledgeBoundary.isForbiddenCategory(category)) {
      return {
        allowed: false,
        reason: `Category '${category}' belongs to project-exclusive domain and cannot be retained in AIOS.`
      };
    }
    return {
      allowed: false,
      reason: `Category '${category}' is unknown and defaulted to forbidden under Principle 003.`
    };
  }
}
