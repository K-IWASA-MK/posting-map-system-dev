import { KnowledgeSemantic } from './KnowledgeSemantic';
import { ILogicalRule } from './ILogicalRule';
import { KnowledgeMetadata } from './KnowledgeMetadata';
import { KnowledgeEvaluation } from './KnowledgeEvaluation';
import { KnowledgeStatus } from './KnowledgeStatus';

export interface KnowledgeAsset {
  readonly schemaVersion: string;
  readonly knowledgeId: string;
  readonly version: number; // 0 for DRAFT, >= 1 for APPROVED
  readonly status: KnowledgeStatus;
  
  readonly semantic: KnowledgeSemantic;
  readonly logicalRules: ReadonlyArray<ILogicalRule>;
  readonly metadata: KnowledgeMetadata;
  readonly evaluation?: KnowledgeEvaluation;
}
