import { PluginManifest, PluginDescriptor } from '../../models/plugin';
import { Command, OSEvent } from '../../models/protocol';
import { ExecutionAttempt } from '../../models/kernel';
import { SdkDescriptor, PluginContext, PluginServices } from '../../sdk/models';
import { PluginTestKit, MockLogger, MockMetrics, MockTracer } from '../../sdk/PluginTestKit';
import { ExampleWorkerPlugin } from '../../sdk/examples/ExampleWorkerPlugin';
import { PluginValidator } from '../../sdk/PluginValidator';

describe('Plugin SDK Foundation Integration Tests (Sprint X-24)', () => {

  const testSdkDescriptor: SdkDescriptor = {
    sdkVersion: '1.0.0',
    minimumApiVersion: '1.0.0',
    maximumApiVersion: '2.0.0'
  };

  const createValidManifest = (): PluginManifest => ({
    pluginId: 'com.example.test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    apiVersion: '1.5.0',
    kind: 'WORKER',
    capabilities: ['EXECUTE'],
    origin: 'INTERNAL',
    entryPoint: 'index.js'
  });

  const createDescriptor = (manifest: PluginManifest): PluginDescriptor => ({
    manifest,
    state: 'DISCOVERED'
  });

  const mockCommand: Command = {
    commandId: 'cmd-001',
    type: 'TestCommand',
    version: '1.0',
    payload: { key: 'value' }
  };

  describe('SDK-001: Manifest & SDK Descriptor', () => {
    it('should initialize PluginBase with Manifest and SdkDescriptor', () => {
      const manifest = createValidManifest();
      const services = PluginTestKit.createMockServices();
      const plugin = new ExampleWorkerPlugin(createDescriptor(manifest), testSdkDescriptor, services);

      expect(plugin.descriptor.manifest.pluginId).toBe('com.example.test-plugin');
      expect(plugin.sdkDescriptor.sdkVersion).toBe('1.0.0');
    });

    it('should throw if descriptor is invalid', () => {
      const services = PluginTestKit.createMockServices();
      expect(() => {
        new ExampleWorkerPlugin({} as PluginDescriptor, testSdkDescriptor, services);
      }).toThrow("PluginDescriptor with valid manifest is required.");
    });
  });

  describe('SDK-002: Capability', () => {
    it('WorkerPluginBase should fulfill ExecutableCapability', async () => {
      const plugin = new ExampleWorkerPlugin(createDescriptor(createValidManifest()), testSdkDescriptor, PluginTestKit.createMockServices());
      
      const context = PluginTestKit.createMockContext('exec-100');
      const events = await plugin.execute(mockCommand, context); // Calling ExecutableCapability method

      expect(events).toBeDefined();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('ExampleProcessed');
    });
  });

  describe('SDK-003: Context', () => {
    it('should bridge OS Core IWorker to SDK PluginContext automatically', async () => {
      const services = PluginTestKit.createMockServices();
      const plugin = new ExampleWorkerPlugin(createDescriptor(createValidManifest()), testSdkDescriptor, services);
      
      const attempt: ExecutionAttempt = {
        executionId: 'bridge-101',
        attempt: 2,
        startedAt: new Date().toISOString(),
        timeoutAt: new Date(Date.now() + 1000).toISOString()
      };

      // Calling OS Core IWorker method
      const events = await plugin.execute(mockCommand, attempt);

      expect(events).toBeDefined();
      expect(events[0].data.processedAttempt).toBe(2);
    });
  });

  describe('SDK-004: Hooks', () => {
    it('should execute beforeExecute and afterExecute hooks successfully', async () => {
      const services = PluginTestKit.createMockServices();
      const plugin = new ExampleWorkerPlugin(createDescriptor(createValidManifest()), testSdkDescriptor, services);
      
      const context = PluginTestKit.createMockContext('hook-exec-1');
      await plugin.execute(mockCommand, context);

      const logger = context.services.logger as MockLogger;
      const metrics = context.services.metrics as MockMetrics;
      const tracer = context.services.tracer as MockTracer;

      expect(logger.logs.length).toBeGreaterThanOrEqual(2);
      expect(logger.logs.some(l => l.message.includes('starting execution'))).toBe(true);
      expect(logger.logs.some(l => l.message.includes('finished execution'))).toBe(true);
      
      expect(metrics.increments['plugin.example.executions']).toBe(1);

      expect(tracer.spans.some(s => s.name === 'ExampleWorkerPlugin_Execute' && s.status === 'ended')).toBe(true);
    });

    it('should execute onError hook if execution fails', async () => {
      const services = PluginTestKit.createMockServices();
      const plugin = new ExampleWorkerPlugin(createDescriptor(createValidManifest()), testSdkDescriptor, services);
      
      const context = PluginTestKit.createMockContext('hook-exec-fail');
      const failCommand: Command = {
        ...mockCommand,
        payload: { shouldFail: true }
      };

      await expect(plugin.execute(failCommand, context)).rejects.toThrow('Simulated business logic failure');

      const logger = context.services.logger as MockLogger;
      const metrics = context.services.metrics as MockMetrics;
      const tracer = context.services.tracer as MockTracer;

      expect(logger.logs.some(l => l.message.includes('failed: hook-exec-fail') && l.level === 'error')).toBe(true);
      expect(metrics.increments['plugin.example.errors']).toBe(1);
    });
  });

  describe('SDK-005: Validator', () => {
    it('should validate manifest successfully', () => {
      const manifest = createValidManifest();
      const result = PluginValidator.validateManifest(manifest);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid manifest', () => {
      const manifest = { name: 'Incomplete' };
      const result = PluginValidator.validateManifest(manifest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate API Compatibility', () => {
      const result = PluginValidator.validateApiCompatibility('1.5.0', testSdkDescriptor);
      expect(result.isValid).toBe(true);

      const invalidOld = PluginValidator.validateApiCompatibility('0.9.0', testSdkDescriptor);
      expect(invalidOld.isValid).toBe(false);

      const invalidNew = PluginValidator.validateApiCompatibility('3.0.0', testSdkDescriptor);
      expect(invalidNew.isValid).toBe(false);
    });

    it('should validate Capabilities', () => {
      const result = PluginValidator.validateCapabilities(['EXECUTE']);
      expect(result.isValid).toBe(true);

      const invalidResult = PluginValidator.validateCapabilities(['INVALID_CAP']);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('SDK-006: ExamplePlugin', () => {
    it('should correctly process command and emit events', async () => {
      const plugin = new ExampleWorkerPlugin(createDescriptor(createValidManifest()), testSdkDescriptor, PluginTestKit.createMockServices());
      const attempt = PluginTestKit.createMockAttempt('test-1');
      
      const events = await plugin.execute(mockCommand, attempt);
      
      expect(events[0].source).toBe('com.example.test-plugin');
      expect(events[0].type).toBe('ExampleProcessed');
      expect(events[0].data.commandVersion).toBe('1.0');
    });
  });

});
