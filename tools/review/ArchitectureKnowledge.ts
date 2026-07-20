export interface ArchitectureKnowledge {
  readonly id: string;
  readonly title: string;
  readonly context: string;
  readonly rootCause: string;
  readonly fix: string;
  readonly outcome: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  readonly pattern: string; // Evaluated matching pattern (e.g. glob path or string keyword)
  readonly lessonLearned: string;
  
  // Reliability and Lifecycle Metadata
  readonly confidence: number; // Reliability confidence level (0.0 - 1.0)
  readonly promotionCount: number; // Number of times validation was confirmed
  readonly lastValidated: string; // ISO date timestamp of last verification
  readonly validationStatus: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  readonly timestamp: string; // ISO creation timestamp
}
