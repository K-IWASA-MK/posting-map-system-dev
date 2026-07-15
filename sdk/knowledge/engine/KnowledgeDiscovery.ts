import { KnowledgeRegistry } from './KnowledgeRegistry';
import { KnowledgeDataset } from '../contracts/KnowledgeDataset';
import { KnowledgePluginResult } from './KnowledgePluginResult';

export class KnowledgeDiscovery {
  constructor(private readonly registry: KnowledgeRegistry) {}

  public synthesizeAll(dataset: KnowledgeDataset): ReadonlyArray<KnowledgePluginResult> {
    const results: KnowledgePluginResult[] = [];
    const plugins = this.registry.getAll();

    for (const plugin of plugins) {
      if (plugin.supports(dataset)) {
        results.push(...plugin.synthesize(dataset));
      }
    }

    return Object.freeze(results);
  }
}
