import { PluginLoader } from '../../../../../../sdk/core/aios/engine/PluginLoader';
import { PluginRegistry } from '../../../../../../sdk/core/aios/engine/PluginRegistry';
import { IDevelopmentPlugin } from '../../../../../../sdk/core/aios/plugin/IDevelopmentPlugin';
import { DevelopmentPluginMetadata } from '../../../../../../sdk/core/aios/plugin/DevelopmentPluginMetadata';
import { DevelopmentPluginId } from '../../../../../../sdk/core/aios/plugin/DevelopmentPluginId';
import { DevelopmentContextType } from '../../../../../../sdk/core/aios/context/DevelopmentContextType';
import { DevelopmentContextBuilder } from '../../../../../../sdk/core/aios/context/DevelopmentContextBuilder';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class DummyPlugin implements IDevelopmentPlugin {
  public metadata: DevelopmentPluginMetadata;
  public status: any;

  constructor(id: string, priority: number, dependencies: string[]) {
    this.metadata = {
      id,
      name: id,
      version: '1.0.0',
      apiVersion: '1.0',
      description: '',
      author: '',
      priority,
      supportedContexts: [DevelopmentContextType.RepositoryReview],
      capabilities: [],
      dependencies
    };
  }

  public supports(context: any): boolean {
    return true; // All support RepositoryReview in this test
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

function runTests() {
  console.log('Running PluginLoader and ExecutionPlan tests...');
  
  const registry = new PluginRegistry();
  // We want to test that higher priority is sorted first.
  // Performance=10, Security=50, Architecture=100
  registry.register(new DummyPlugin(DevelopmentPluginId.Performance, 10, []));
  registry.register(new DummyPlugin(DevelopmentPluginId.Security, 50, []));
  registry.register(new DummyPlugin(DevelopmentPluginId.Architecture, 100, [DevelopmentPluginId.Security]));

  const loader = new PluginLoader();
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const plan = loader.loadAndPlan(registry, context);

  assert(plan.nodes.length === 3, 'Plan should contain 3 nodes');
  assert(plan.nodes[0].pluginId === DevelopmentPluginId.Architecture, 'Highest priority (100) should be first');
  assert(plan.nodes[1].pluginId === DevelopmentPluginId.Security, 'Priority 50 should be second');
  assert(plan.nodes[2].pluginId === DevelopmentPluginId.Performance, 'Priority 10 should be third');

  // Verify dependencies field was populated
  assert(plan.nodes[0].dependencies.length === 1 && plan.nodes[0].dependencies[0] === DevelopmentPluginId.Security, 'Dependencies should be mapped');

  console.log('All PluginLoader and ExecutionPlan tests passed!');
}

runTests();
