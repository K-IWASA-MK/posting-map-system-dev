export interface KnowledgeRequest {
  readonly schemaVersion: string;
  readonly requestId: string;
  readonly filters: Readonly<Record<string, unknown>>;
}
