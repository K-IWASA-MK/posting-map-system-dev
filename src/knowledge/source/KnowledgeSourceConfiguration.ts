export interface KnowledgeSourceConfiguration {
  readonly maxPatternsLimit?: number;
  readonly defaultPatternTypes?: ReadonlyArray<string>;
  readonly sortingField: 'patternId' | 'createdAt';
  readonly schemaVersion: string;
}
