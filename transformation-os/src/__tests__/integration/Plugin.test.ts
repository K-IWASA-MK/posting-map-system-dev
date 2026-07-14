import { DefaultPluginLoader } from '../../engine/plugin/DefaultPluginLoader';
import { DefaultPluginRegistry } from '../../engine/plugin/DefaultPluginRegistry';
import { PluginLifecyclePolicy } from '../../engine/plugin/PluginLifecycle';
import { PluginManifest, PluginCapability, PluginOrigin } from '../../models/plugin';

describe('Layer 7: Plugin Runtime Foundation (Sprint X-23)', () => {
  let loader: DefaultPluginLoader;
  let registry: DefaultPluginRegistry;

  const validManifestPayload = {
    pluginId: 'com.postingmap.worker.test',
    name: 'Test Worker Plugin',
    version: '1.0.0',
    minimumApiVersion: '1.0.0',
    maximumApiVersion: '2.0.0',
    kind: 'WORKER',
    capabilities: [PluginCapability.EXECUTE],
    signature: '0xabc123',
    checksum: 'sha256-xyz'
  };

  beforeEach(() => {
    // OS Core is currently at version 1.5.0
    loader = new DefaultPluginLoader('1.5.0');
    registry = new DefaultPluginRegistry();
  });

  it('Plugin-001: Manifest Validation (Throws on invalid format)', async () => {
    const invalidPayload = { pluginId: 123 }; // Should be string
    
    await expect(loader.load(invalidPayload)).rejects.toThrow(/Manifest Validation Failed/);
  });

  it('Plugin-002: Registry (Successful registration and retrieval)', async () => {
    const plugin = await loader.load(validManifestPayload);
    registry.register(plugin);
    
    const retrieved = registry.get('com.postingmap.worker.test');
    expect(retrieved).toBeDefined();
    expect(retrieved?.descriptor.manifest.name).toBe('Test Worker Plugin');
    
    // Check initial state translation
    expect(retrieved?.descriptor.state).toBe('REGISTERED');
  });

  it('Plugin-003: Duplicate Registration (Throws on duplicate ID)', async () => {
    const plugin1 = await loader.load(validManifestPayload);
    const plugin2 = await loader.load(validManifestPayload);
    
    registry.register(plugin1);
    
    expect(() => registry.register(plugin2)).toThrow(/Duplicate pluginId/);
  });

  it('Plugin-004: Lifecycle Transition (Enforces state machine)', async () => {
    const plugin = await loader.load(validManifestPayload);
    registry.register(plugin); // Transitions to REGISTERED
    
    // Valid transition
    expect(() => registry.transitionState('com.postingmap.worker.test', 'LOADED')).not.toThrow();
    
    // Invalid transition: LOADED -> DISCOVERED is forbidden
    expect(() => registry.transitionState('com.postingmap.worker.test', 'DISCOVERED'))
      .toThrow(/Invalid plugin lifecycle transition/);
  });

  it('Plugin-005: Capability Discovery (Reads capabilities correctly)', async () => {
    const plugin = await loader.load(validManifestPayload);
    registry.register(plugin);
    
    const retrieved = registry.get('com.postingmap.worker.test')!;
    const capabilities = retrieved.descriptor.manifest.capabilities;
    
    expect(capabilities).toContain(PluginCapability.EXECUTE);
    expect(capabilities).not.toContain(PluginCapability.STORE);
  });

  it('Plugin-006: API Compatibility (Enforces min/max version bounds)', async () => {
    // OS is 1.5.0
    const pluginTooNew = { ...validManifestPayload, minimumApiVersion: '2.0.0' };
    const pluginTooOld = { ...validManifestPayload, maximumApiVersion: '1.0.0' };
    
    await expect(loader.load(pluginTooNew)).rejects.toThrow(/API Compatibility Error: OS API .* is older than plugin minimum/);
    await expect(loader.load(pluginTooOld)).rejects.toThrow(/API Compatibility Error: OS API .* is newer than plugin maximum/);
  });

  it('Plugin-007: Origin (Defaults to LOCAL origin)', async () => {
    const plugin = await loader.load(validManifestPayload);
    
    expect(plugin.descriptor.origin).toBe(PluginOrigin.LOCAL);
  });

  it('Plugin-008: Signature Presence (Manifest holds signature and checksum)', async () => {
    const plugin = await loader.load(validManifestPayload);
    
    expect(plugin.descriptor.manifest.signature).toBe('0xabc123');
    expect(plugin.descriptor.manifest.checksum).toBe('sha256-xyz');
  });
});
