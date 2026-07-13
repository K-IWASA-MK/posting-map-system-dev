export interface MergePolicy {
  strategy: 'REPLACE' | 'MERGE' | 'APPEND';
  allowPartialMerge: boolean;
  requireHumanReviewOnDiff: boolean;
}
