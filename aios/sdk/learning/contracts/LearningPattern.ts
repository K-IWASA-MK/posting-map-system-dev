import { PatternStatus, PatternType } from './types';
import { IPatternData } from './IPatternData';
import { IPatternStatistics } from './IPatternStatistics';
import { PatternEvaluation } from './PatternEvaluation';

/**
 * LearningPattern is a versioned immutable repository asset owned by AIOS, 
 * independent of any individual execution.
 * 
 * It strictly separates Identity (patternId) and Version (version).
 * All properties are readonly, and instances should be frozen (Object.freeze) upon creation.
 */
export interface LearningPattern {
  // --- Asset Identity & State ---
  readonly schemaVersion: string;   // e.g., "1.0.0"
  readonly patternId: string;       // Identity (e.g. PAT-SEQ-001)
  readonly version: number;         // Immutable Version
  readonly status: PatternStatus;   // Lifecycle state
  readonly createdAt: string;

  // --- Objective Data (Engine Output) ---
  readonly sourceDatasetIds: ReadonlyArray<string>; // Supports aggregation across multiple executions
  readonly patternType: PatternType;
  readonly patternData: IPatternData;               // Polymorphic data (no 'any')
  readonly statistics: IPatternStatistics;          // Polymorphic stats

  // --- Evaluation Data (Governance Output) ---
  readonly evaluation?: PatternEvaluation;          // Undefined until status reaches APPROVED
}
