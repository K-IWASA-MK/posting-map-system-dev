export interface KnowledgeMetadata {
  readonly sourcePatternIds: ReadonlyArray<string>;
  readonly createdAt: string;
  readonly generatedBy: string;
  readonly approvedBy?: string;
  readonly schemaVersion: string;
}
