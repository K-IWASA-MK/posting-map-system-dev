import { IDevelopmentPlugin } from '../../../../../../src/core/aios/plugin/IDevelopmentPlugin';
import { DevelopmentPluginMetadata } from '../../../../../../src/core/aios/plugin/DevelopmentPluginMetadata';
import { DevelopmentPluginId } from '../../../../../../src/core/aios/plugin/DevelopmentPluginId';
import { DevelopmentPluginStatus } from '../../../../../../src/core/aios/plugin/DevelopmentPluginStatus';
import { DevelopmentPluginResult } from '../../../../../../src/core/aios/plugin/DevelopmentPluginResult';
import { DevelopmentContext } from '../../../../../../src/core/aios/context/DevelopmentContext';
import { DevelopmentContextBuilder } from '../../../../../../src/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../src/core/aios/context/DevelopmentContextType';
import { PluginLifecycleManager } from '../../../../../../src/core/aios/plugin/PluginLifecycleManager';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// A simple mock plugin that adheres strictly to the interface.
// It also simulates an OS-side status update by the manager (Engine).
class MockPlugin implements IDevelopmentPlugin {
  public metadata: DevelopmentPluginMetadata;
  public status: DevelopmentPluginStatus = DevelopmentPluginStatus.UNLOADED;
  public trace: string[] = [];

  constructor() {
    this.metadata = Object.freeze({
      id: DevelopmentPluginId.Testing,
      name: 'Mock Testing Plugin',
      version: '1.0.0',
      apiVersion: '1.0',
      description: 'A mock plugin',
      author: 'AI',
      priority: 1,
      supportedContexts: Object.freeze([DevelopmentContextType.RepositoryReview]),
      capabilities: Object.freeze([]),
      dependencies: Object.freeze([])
    });
  }

  // Helper to change state simulating the Engine's work
  public setStatus(newStatus: DevelopmentPluginStatus) {
    PluginLifecycleManager.validateTransition(this.status, newStatus);
    this.status = newStatus;
  }

  public supports(context: DevelopmentContext): boolean {
    return this.metadata.supportedContexts.includes(context.contextType);
  }

  public async initialize(context: DevelopmentContext): Promise<void> {
    this.trace.push('initialize');
  }

  public async beforeValidate(context: DevelopmentContext): Promise<void> {
    this.trace.push('beforeValidate');
  }

  public async validate(context: DevelopmentContext): Promise<void> {
    this.trace.push('validate');
  }

  public async afterValidate(context: DevelopmentContext): Promise<void> {
    this.trace.push('afterValidate');
  }

  public async review(context: DevelopmentContext): Promise<void> {
    this.trace.push('review');
  }

  public async govern(context: DevelopmentContext): Promise<void> {
    this.trace.push('govern');
  }

  public async report(context: DevelopmentContext): Promise<DevelopmentPluginResult> {
    this.trace.push('report');
    return {
      pluginId: this.metadata.id,
      status: this.status,
      durationMs: 100,
      artifacts: [],
      generatedAt: new Date().toISOString()
    };
  }

  public async dispose(): Promise<void> {
    this.trace.push('dispose');
  }
}

async function runTests() {
  console.log('Running IDevelopmentPlugin tests (Mock Plugin Simulation)...');

  const plugin = new MockPlugin();
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('mock-project')
    .build();

  // Test supports
  assert(plugin.supports(context), 'Mock plugin should support RepositoryReview');

  // Simulate Engine orchestrating the lifecycle
  plugin.setStatus(DevelopmentPluginStatus.DISCOVERED);
  plugin.setStatus(DevelopmentPluginStatus.LOADED);
  
  await plugin.initialize(context);
  plugin.setStatus(DevelopmentPluginStatus.INITIALIZED);
  plugin.setStatus(DevelopmentPluginStatus.READY);

  plugin.setStatus(DevelopmentPluginStatus.RUNNING);
  await plugin.beforeValidate(context);
  await plugin.validate(context);
  await plugin.afterValidate(context);
  await plugin.review(context);
  await plugin.govern(context);
  const result = await plugin.report(context);
  
  assert(result.pluginId === DevelopmentPluginId.Testing, 'Report should have correct plugin ID');
  
  plugin.setStatus(DevelopmentPluginStatus.COMPLETED);

  await plugin.dispose();
  plugin.setStatus(DevelopmentPluginStatus.DISPOSED);

  // Check that all traces were recorded in order
  const expectedTrace = [
    'initialize',
    'beforeValidate',
    'validate',
    'afterValidate',
    'review',
    'govern',
    'report',
    'dispose'
  ];

  assert(plugin.trace.length === expectedTrace.length, 'Trace length mismatch');
  for (let i = 0; i < expectedTrace.length; i++) {
    assert(plugin.trace[i] === expectedTrace[i], `Trace mismatch at ${i}: expected ${expectedTrace[i]}, got ${plugin.trace[i]}`);
  }

  console.log('All IDevelopmentPlugin tests passed!');
}

runTests().catch(e => {
  console.error('Test failed with error:', e);
  process.exit(1);
});
