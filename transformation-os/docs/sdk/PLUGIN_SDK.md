# Transformation OS: Plugin SDK Foundation

This document outlines the core architecture and usage guidelines for the **Plugin SDK**. The SDK is the official developer toolset for creating third-party and internal extensions for the OS Core.

## 1. Plugin Structure & Base Classes

The SDK enforces a Capability-Based Composition model rather than deep inheritance.

### `PluginBase`
All plugins extend `PluginBase`. It encapsulates:
- `PluginDescriptor`: The immutable state of the plugin including its manifest.
- `SdkDescriptor`: The SDK versioning contract.
- **Hooks**: Lifecycle callbacks (`beforeExecute`, `afterExecute`, `onError`, `dispose`).

### `WorkerPluginBase`
For standard execution workers, the SDK provides `WorkerPluginBase`. It automatically composes `PluginBase` and `ExecutableCapability`, bridging the OS Core `IWorkerPlugin` interface with the SDK's internal context structure.

---

## 2. Capability Interfaces

Plugins declare their behaviors by implementing **Capabilities**. Capabilities are strictly isolated and must not depend on each other.

- `ExecutableCapability`: Execute an automation command.
- `ProjectableCapability`: Project events into a read-model state.
- `PublishCapability`: Publish events to external systems.
- `MetricsCapability`: Provide metrics collection.
- `SecurityCapability`: Validate commands against security rules.

Example: `WorkerPluginBase` natively implements `ExecutableCapability`.

---

## 3. Plugin Context & Services

Plugins do not directly access the OS `ExecutionContext`. Instead, they receive a `PluginContext`.

### `PluginContext`
```typescript
export interface PluginContext {
  readonly execution: ExecutionAttempt;
  readonly services: PluginServices;
}
```

### `PluginServices`
The SDK injects common OS services, ensuring plugins remain pure and testable:
- `ILogger`: Structured logging (`info`, `warn`, `error`, `debug`).
- `IMetrics`: Telemetry collection (`increment`, `gauge`, `timing`).
- `ITracer`: Distributed tracing (`startSpan`, `endSpan`, `addTag`).

---

## 4. Lifecycle Hooks

The SDK provides AOP-style lifecycle hooks for transparent aspect injection (such as metrics and learning algorithms in Generation 5).

- `beforeExecute(context)`: Called before capability execution.
- `afterExecute(context)`: Called after successful capability execution.
- `onError(error, context)`: Called when capability execution throws.
- `dispose()`: Called when the plugin is unloaded.

---

## 5. Versioning (Three-Tier Compatibility)

Plugins operate under a Three-Tier Compatibility constraint:
1. **Manifest (`apiVersion`)**: The API version the plugin expects.
2. **SDK (`minimumApiVersion`, `maximumApiVersion`)**: The API ranges the SDK supports.
3. **OS Core**: Evaluates the intersection of the Manifest and the SDK boundaries.

---

## 6. Example Plugin

The following represents the Gold Standard for SDK Worker implementation.

```typescript
import { WorkerPluginBase, PluginContext, Command, OSEvent } from '@posting-map/transformation-os-sdk';

export class ExampleWorkerPlugin extends WorkerPluginBase {
  
  async beforeExecute(context: PluginContext): Promise<void> {
    context.services.logger.info('Starting...');
  }

  protected async doExecute(command: Command, context: PluginContext): Promise<readonly OSEvent[]> {
    return [{
      eventId: 'evt-1',
      subjectURI: 'resource://example/1',
      type: 'Completed',
      timestamp: new Date().toISOString(),
      source: this.descriptor.manifest.pluginId,
      data: { commandId: command.commandId }
    }];
  }
}
```

## 7. Testing

Use the `PluginTestKit` to write isolated unit tests without needing the OS Core:

```typescript
import { PluginTestKit } from '@posting-map/transformation-os-sdk';

const mockContext = PluginTestKit.createMockContext('exec-1');
const plugin = new ExampleWorkerPlugin(mockDescriptor, mockSdkDescriptor, mockContext.services);

const events = await plugin.execute(mockCommand, mockContext);
```
