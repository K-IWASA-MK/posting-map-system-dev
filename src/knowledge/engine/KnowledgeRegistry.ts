import { IKnowledgePlugin } from './IKnowledgePlugin';

export class KnowledgeRegistry {
  private readonly plugins: IKnowledgePlugin[] = [];

  public register(plugin: IKnowledgePlugin): void {
    if (this.plugins.some(p => p.pluginId === plugin.pluginId)) {
      throw new Error(`KnowledgePlugin ${plugin.pluginId} is already registered`);
    }
    this.plugins.push(plugin);
    // Sort descending by priority
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  public getSupportedPlugins(patternType: string): IKnowledgePlugin[] {
    return this.plugins.filter(p => p.targetPatternType === patternType);
  }

  public getAll(): IKnowledgePlugin[] {
    return [...this.plugins];
  }
}
