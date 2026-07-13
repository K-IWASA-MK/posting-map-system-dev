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

  constructor(id: DevelopmentPluginId, supportedContext: DevelopmentContextType) {
    this.metadata = {
      id,
      name: `Dummy ${id}`,
      version: '1.0.0',
      apiVersion: '1.0',
      description: '',
      author: '',
      priority: 1,
      supportedContexts: [supportedContext],
      capabilities: [],
      dependencies: []
    };
  }

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

function runTests() {
  console.log('Running PluginRegistry tests...');
  
  const registry = new PluginRegistry();
  const perfPlugin = new DummyPlugin(DevelopmentPluginId.Performance, DevelopmentContextType.RepositoryReview);
  const uiPlugin = new DummyPlugin(DevelopmentPluginId.UI, DevelopmentContextType.UIReview);

  // Test register and findAll
  registry.register(perfPlugin);
  registry.register(uiPlugin);
  
  const all = registry.findAll();
  assert(all.length === 2, 'Should have 2 registered plugins');

  // Test findById
  const found = registry.findById(DevelopmentPluginId.Performance);
  assert(found !== undefined && found.metadata.id === DevelopmentPluginId.Performance, 'Should find Performance plugin');

  // Test duplicate register
  let threwError = false;
  try {
    registry.register(perfPlugin);
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw error when registering duplicate plugin ID');

  // Test findSupported
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const supported = registry.findSupported(context);
  assert(supported.length === 1, 'Should find exactly 1 supported plugin');
  assert(supported[0].metadata.id === DevelopmentPluginId.Performance, 'Supported plugin should be Performance');

  // Test clear
  registry.clear();
  assert(registry.findAll().length === 0, 'Registry should be empty after clear');

  console.log('All PluginRegistry tests passed!');
}

runTests();
