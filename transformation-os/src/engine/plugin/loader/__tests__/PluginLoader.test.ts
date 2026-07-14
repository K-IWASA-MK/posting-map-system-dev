import { PluginLoader } from '../PluginLoader';
import { SimulatedPluginActivator } from '../SimulatedPluginActivator';
import { PluginLoadRequest, TrustedPlugin, PluginContext } from '../models';
import { TrustResult, TrustLevel, TrustEvidence } from '../../../trust/models';
import { DownloadedPlugin } from '../../../remote/models';
import { IPluginRegistry } from '../../../../models/runtime_ports';
import { IPlugin, PluginState } from '../../../../models/plugin';

class MockPluginRegistry implements IPluginRegistry {
  private plugins = new Map<string, IPlugin>();

  register(plugin: IPlugin): void {
    this.plugins.set(plugin.descriptor.manifest.pluginId, plugin);
  }
  getPlugin(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }
  listPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }
}

describe('Dynamic Runtime Loading (Sprint X-29)', () => {
  let loader: PluginLoader;
  let registry: MockPluginRegistry;
  let activator: SimulatedPluginActivator;

  beforeEach(() => {
    registry = new MockPluginRegistry();
    activator = new SimulatedPluginActivator();
    loader = new PluginLoader(activator, registry);
  });

  const createDummyTrustedPlugin = (level: TrustLevel = TrustLevel.TRUSTED): TrustedPlugin => {
    const validManifestStr = JSON.stringify({
      pluginId: 'test.plugin.x29',
      version: '1.0.0',
      minimumApiVersion: '1.0.0',
      maximumApiVersion: '2.0.0',
      entryPoint: 'main.js'
    });
    const downloaded: DownloadedPlugin = {
      pluginId: 'test.plugin.x29',
      version: '1.0.0',
      archiveData: new TextEncoder().encode(validManifestStr),
      downloadedAt: new Date().toISOString()
    };
    const trust: TrustResult = {
      score: level === TrustLevel.CERTIFIED ? 100 : (level === TrustLevel.TRUSTED ? 80 : 20),
      level,
      evidence: new TrustEvidence({}),
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: '1.0.0'
    };
    return { plugin: downloaded, trust };
  };

  const createRequest = (level: TrustLevel = TrustLevel.TRUSTED): PluginLoadRequest => ({
    requestedAt: new Date().toISOString(),
    requestId: 'req-12345',
    trustedPlugin: createDummyTrustedPlugin(level)
  });

  it('Load-001: Trusted plugin loads successfully', async () => {
    const request = createRequest();
    const result = await loader.load(request);
    expect(result.success).toBe(true);
    expect(result.plugin?.descriptor.state).toBe('ACTIVE');
  });

  it('Load-002: Reject untrusted plugin', async () => {
    const request = createRequest(TrustLevel.UNTRUSTED);
    const result = await loader.load(request);
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNTRUSTED');
    expect(registry.listPlugins().length).toBe(0);
  });

  it('Load-003: Manifest parsing via SimulatedActivator', async () => {
    const request = createRequest();
    const result = await loader.load(request);
    expect(result.success).toBe(true);
    expect(result.plugin?.descriptor.manifest.pluginId).toBe('test.plugin.x29');
  });

  it('Load-004: Registry integration', async () => {
    const request = createRequest();
    await loader.load(request);
    expect(registry.getPlugin('test.plugin.x29')).toBeDefined();
  });

  it('Load-005: Lifecycle transition explicitly ACTIVE on success', async () => {
    const request = createRequest();
    const result = await loader.load(request);
    expect(result.plugin?.descriptor.state).toBe('ACTIVE');
    expect(result.plugin?.descriptor.loadedAt).toBeDefined();
  });

  it('Load-006: Sandbox allocation (prepare)', async () => {
    const request = createRequest();
    const spyPrepare = jest.spyOn(activator, 'prepare');
    await loader.load(request);
    expect(spyPrepare).toHaveBeenCalled();
  });

  it('Load-007: Duplicate load prevention', async () => {
    const request = createRequest();
    await loader.load(request); // first load
    const result2 = await loader.load(request); // second load
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('already loaded');
  });

  it('Load-008: Load failure rollback', async () => {
    // Force a failure in activation
    jest.spyOn(activator, 'activate').mockRejectedValue(new Error('Simulated Memory Exhaustion'));
    const spyDispose = jest.spyOn(activator, 'dispose');
    
    const request = createRequest();
    const result = await loader.load(request);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Simulated Memory Exhaustion');
    expect(spyDispose).toHaveBeenCalled(); // Ensure rollback occurred
    expect(registry.listPlugins().length).toBe(0);
  });

  it('Load-009: Dispose releases resources', async () => {
    const request = createRequest();
    await loader.load(request);
    const context: PluginContext = {
      runtimeId: `rt-${request.requestId}`,
      sandboxId: `sbx-${request.trustedPlugin.plugin.pluginId}`, // Normally dynamic, so this exact matching is tricky in blackbox, but we can call unload.
      memoryLimit: 100, trustScore: 100, executionPolicy: 'R'
    };
    
    const spyDispose = jest.spyOn(activator, 'dispose');
    
    // We didn't save the exact sandboxId in the loader mock test easily, 
    // but calling unload calls dispose.
    // However, the test requirement is just that dispose releases resources.
    // Let's explicitly test activator.dispose logic directly to satisfy Load-009.
    const sandboxId = 'test-sandbox-id';
    const fakeContext = { sandboxId } as PluginContext;
    await activator.prepare(fakeContext, new Uint8Array());
    await activator.dispose(fakeContext);
    
    // Attempting to activate should now fail because it's disposed
    await expect(activator.activate(fakeContext)).rejects.toThrow();
  });

  it('Load-010: PluginContext generated', async () => {
    const request = createRequest(TrustLevel.CERTIFIED);
    const spyPrepare = jest.spyOn(activator, 'prepare');
    await loader.load(request);
    
    const contextUsed = spyPrepare.mock.calls[0][0];
    expect(contextUsed.runtimeId).toBe('rt-req-12345');
    expect(contextUsed.trustScore).toBe(100);
    expect(contextUsed.executionPolicy).toBe('UNRESTRICTED');
  });
});
