export interface KnowledgeVersion {
  version: string; // e.g. v2.4.0
  revision: string; // e.g. r134
  hash: string;
  createdAt: Date;
}
