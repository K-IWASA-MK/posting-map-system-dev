import { DevelopmentRuleEngine } from '../../../../../../sdk/core/aios/engine/DevelopmentRuleEngine';
import { PluginRegistry } from '../../../../../../sdk/core/aios/engine/PluginRegistry';
import { IDevelopmentPlugin } from '../../../../../../sdk/core/aios/plugin/IDevelopmentPlugin';
import { DevelopmentPluginMetadata } from '../../../../../../sdk/core/aios/plugin/DevelopmentPluginMetadata';
import { DevelopmentPluginId } from '../../../../../../sdk/core/aios/plugin/DevelopmentPluginId';
import { DevelopmentPluginStatus } from '../../../../../../sdk/core/aios/plugin/DevelopmentPluginStatus';
import { DevelopmentContextType } from '../../../../../../sdk/core/aios/context/DevelopmentContextType';
import { DevelopmentContextBuilder } from '../../../../../../sdk/core/aios/context/DevelopmentContextBuilder';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockPerformancePlugin implements IDevelopmentPlugin {
  public metadata: DevelopmentPluginMetadata = {
    id: DevelopmentPluginId.Performance,
    name: 'Perf',
    version: '1.0',
    apiVersion: '1.0',
    description: '',
    author: '',
    priority: 10,
    supportedContexts: [DevelopmentContextType.RepositoryReview],
    capabilities: [],
    dependencies: []
  };
  public status: DevelopmentPluginStatus = DevelopmentPluginStatus.UNLOADED;
  public calledMethods: string[] = [];

  public supports(context: any): boolean {
    return this.metadata.supportedContexts.includes(context.contextType);
  }
  async initialize() { this.calledMethods.push('initialize'); }
  async beforeValidate() { this.calledMethods.push('beforeValidate'); }
  async validate() { this.calledMethods.push('validate'); }
  async afterValidate() { this.calledMethods.push('afterValidate'); }
  async review() { this.calledMethods.push('review'); }
  async govern() { this.calledMethods.push('govern'); }
  async report(): Promise<any> { return { pluginId: this.metadata.id, artifacts: [], generatedAt: '' }; }
  async dispose() { this.calledMethods.push('dispose'); }
}

class MockUIPlugin implements IDevelopmentPlugin {
  public metadata: DevelopmentPluginMetadata = {
    id: DevelopmentPluginId.UI,
    name: 'UI',
    version: '1.0',
    apiVersion: '1.0',
    description: '',
    author: '',
    priority: 20,
    supportedContexts: [DevelopmentContextType.UIReview], // Supports UI Review only
    capabilities: [],
    dependencies: []
  };
  public status: DevelopmentPluginStatus = DevelopmentPluginStatus.UNLOADED;
  
  public supports(context: any): boolean {
    return this.metadata.supportedContexts.includes(context.contextType);
  }
  async initialize() {}
  async beforeValidate() {}
  async validate() {}
  async afterValidate() {}
  async review() {}
  async govern() {}
  async report(): Promise<any> { return {} as any; }
  async dispose() {}
}

async function runTests() {
  console.log('Running DevelopmentRuleEngine tests...');
  
  const registry = new PluginRegistry();
  const perfPlugin = new MockPerformancePlugin();
  const uiPlugin = new MockUIPlugin();
  
  registry.register(perfPlugin);
  registry.register(uiPlugin);

  const engine = new DevelopmentRuleEngine(registry);

  // Repository Review runs only Performance Plugin
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const result = await engine.execute(context);

  assert(result.executedPlugins.length === 1, 'Only 1 plugin should execute');
  assert(result.executedPlugins[0] === DevelopmentPluginId.Performance, 'Performance plugin should execute');
  
  assert(perfPlugin.status === DevelopmentPluginStatus.DISPOSED, 'Performance plugin should end in DISPOSED state');
  assert(uiPlugin.status === DevelopmentPluginStatus.UNLOADED, 'UI plugin should remain UNLOADED');
  
  const expectedCalls = ['initialize', 'beforeValidate', 'validate', 'afterValidate', 'review', 'govern', 'dispose'];
  assert(perfPlugin.calledMethods.length === expectedCalls.length, 'All lifecycle methods should be called');

  console.log('All DevelopmentRuleEngine tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
