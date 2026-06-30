import { KnowledgeDefinition } from "./KnowledgeDefinition";
import { KnowledgeContext } from "./KnowledgeContext";

export interface IKnowledgeEngine {
  register(definition: KnowledgeDefinition, context: KnowledgeContext): Promise<boolean>;
  resolve(id: string, context: KnowledgeContext): Promise<KnowledgeDefinition | null>;
  list(context: KnowledgeContext): Promise<KnowledgeDefinition[]>;
}

export abstract class BaseKnowledgeEngine implements IKnowledgeEngine {
  abstract register(definition: KnowledgeDefinition, context: KnowledgeContext): Promise<boolean>;
  abstract resolve(id: string, context: KnowledgeContext): Promise<KnowledgeDefinition | null>;
  abstract list(context: KnowledgeContext): Promise<KnowledgeDefinition[]>;
}
