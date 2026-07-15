import { KnowledgeType } from "./KnowledgeType";
import { KnowledgeStatus } from "./KnowledgeStatus";
import { KnowledgeMetadata } from "./KnowledgeMetadata";

export interface KnowledgeDefinition {
  id: string;
  name: string;
  version: string;
  type: KnowledgeType;
  status: KnowledgeStatus;
  metadata: KnowledgeMetadata;
}
