import { KnowledgeSemantic, ILogicalRule } from '../contracts';

export interface KnowledgePluginResult {
  readonly pluginId: string;
  readonly semantic: KnowledgeSemantic;
  readonly logicalRules: ReadonlyArray<ILogicalRule>;
  readonly sourcePatternIds: ReadonlyArray<string>;
  readonly durationMs: number;
  readonly warnings: ReadonlyArray<string>;
}
