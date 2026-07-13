export interface ConflictPolicy {
  strictSemanticCheck: boolean;
  failOnDuplicate: boolean;
  ignoredConflictTypes: string[];
}
