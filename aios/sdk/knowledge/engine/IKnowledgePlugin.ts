import { KnowledgeDataset } from '../contracts/KnowledgeDataset';
import { KnowledgePluginResult } from './KnowledgePluginResult';

export interface IKnowledgePlugin {
  readonly pluginId: string;
  readonly targetPatternType: string;
  readonly version: string;
  readonly priority: number;
  
  supports(dataset: KnowledgeDataset): boolean;
  synthesize(dataset: KnowledgeDataset): ReadonlyArray<KnowledgePluginResult>;
}
