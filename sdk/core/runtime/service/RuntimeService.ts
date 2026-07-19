import { IRuntimeService } from './IRuntimeService';
import { IRuntime } from '../IRuntime';
import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { RuntimeDiscovery } from '../discovery/RuntimeDiscovery';
import { RuntimeState } from '../RuntimeState';
import { RuntimeHealth, RuntimeHealthStatus } from '../RuntimeHealth';
import { AIOSEventBus } from '../../event/AIOSEventBus';
import { AIOSEvent } from '../../event/AIOSEvent';
import { RuntimeContext } from '../RuntimeContext';

export class RuntimeService implements IRuntimeService {
  private readonly registry: RuntimeRegistry;
  private readonly discoveryObj: RuntimeDiscovery;

  constructor(
    private readonly eventBus: AIOSEventBus,
    registry?: RuntimeRegistry
  ) {
    this.registry = registry || new RuntimeRegistry();
    this.discoveryObj = new RuntimeDiscovery(this.registry);
  }

  public get discovery(): RuntimeDiscovery {
    return this.discoveryObj;
  }

  public async register(runtime: IRuntime, runtimeType: string = 'generic'): Promise<void> {
    const runtimeId = runtime.id || runtime.descriptor.runtimeId;

    // Validation coupling: check if validation runtime is registered and use it to validate the new runtime
    if (runtimeId !== 'aios.validation') {
      try {
        const valEntry = this.registry.get('aios.validation');
        if (valEntry) {
          // If Validation Runtime is active, validate the incoming runtime manifest or descriptor
          await valEntry.runtime.validate(runtime.manifest || runtime.descriptor);
        }
      } catch (err: any) {
        throw new Error(`[RuntimeService] Validation failed for runtime ${runtimeId}: ${err.message}`);
      }
    }

    this.registry.register(runtime, runtimeType);
    
    await this.publishEvent('RuntimeRegistered', {
      runtimeId,
      runtimeType,
      version: runtime.version || runtime.descriptor.version,
      state: RuntimeState.REGISTERED
    });
  }

  public async deregister(runtimeId: string): Promise<void> {
    const entry = this.registry.get(runtimeId);
    if (!entry) return;

    this.registry.deregister(runtimeId);
    await this.publishEvent('RuntimeRemoved', {
      runtimeId,
      state: RuntimeState.STOPPED
    });
  }

  public resolve(runtimeId: string): IRuntime {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Failed to resolve runtime: ${runtimeId}`);
    }
    return entry.runtime;
  }

  public getState(runtimeId: string): RuntimeState {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }
    return entry.stateMachine.getState();
  }

  public async getHealth(runtimeId: string): Promise<RuntimeHealth> {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }
    try {
      const h = entry.runtime.health ? entry.runtime.health() : await entry.runtime.getHealth();
      // Ensure compatibility properties are set
      return {
        ...h,
        lastChecked: h.lastChecked || h.lastCheckedAt,
        message: h.message || h.reason
      };
    } catch (err: any) {
      return {
        status: RuntimeHealthStatus.UNHEALTHY,
        lastCheckedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        reason: err.message,
        message: err.message
      };
    }
  }

  public async initializeRuntime(runtimeId: string, context?: RuntimeContext): Promise<void> {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }

    const defaultContext: RuntimeContext = context || {
      runtimeId,
      workspaceId: 'workspace-default',
      executionId: `EXEC-INIT-${Date.now()}`,
      traceId: `TRACE-${Date.now()}`,
      configuration: {},
      services: {},
      sessionId: `SESSION-${Date.now()}`,
      environment: 'development',
      capabilities: entry.capabilities
    };

    await entry.stateMachine.transition(RuntimeState.INITIALIZING);
    try {
      await entry.runtime.initialize(defaultContext);
      await entry.stateMachine.transition(RuntimeState.READY);
      await this.publishEvent('RuntimeReady', {
        runtimeId,
        state: RuntimeState.READY
      });
    } catch (err: any) {
      await entry.stateMachine.transition(RuntimeState.FAILED);
      throw err;
    }
  }

  public async startRuntime(runtimeId: string): Promise<void> {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }

    const state = entry.stateMachine.getState();
    if (state !== RuntimeState.READY) {
      throw new Error(`Runtime must be READY to start. Current state: ${state}`);
    }

    await entry.stateMachine.transition(RuntimeState.RUNNING);
    try {
      if (entry.runtime.start) {
        await entry.runtime.start();
      } else if (entry.runtime.execute && entry.runtime.manifest) {
        await entry.runtime.execute(entry.runtime.manifest);
      }
      await this.publishEvent('RuntimeStarted', {
        runtimeId,
        state: RuntimeState.RUNNING
      });
    } catch (err: any) {
      await entry.stateMachine.transition(RuntimeState.FAILED);
      throw err;
    }
  }

  public async stopRuntime(runtimeId: string): Promise<void> {
    const entry = this.registry.get(runtimeId);
    if (!entry) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }

    await entry.stateMachine.transition(RuntimeState.STOPPING);
    try {
      if (entry.runtime.stop) {
        await entry.runtime.stop();
      } else if (entry.runtime.shutdown) {
        await entry.runtime.shutdown();
      }
      await entry.stateMachine.transition(RuntimeState.STOPPED);
      await this.publishEvent('RuntimeStopped', {
        runtimeId,
        state: RuntimeState.STOPPED
      });
    } catch (err: any) {
      await entry.stateMachine.transition(RuntimeState.FAILED);
      throw err;
    }
  }

  // Active / Deactivate orchestration
  public async activateRuntime(runtimeId: string): Promise<void> {
    const state = this.getState(runtimeId);
    if (state === RuntimeState.REGISTERED) {
      await this.initializeRuntime(runtimeId);
    }
    const freshState = this.getState(runtimeId);
    if (freshState === RuntimeState.READY) {
      await this.startRuntime(runtimeId);
    }
  }

  public async deactivateRuntime(runtimeId: string): Promise<void> {
    const state = this.getState(runtimeId);
    if (state === RuntimeState.RUNNING || state === RuntimeState.READY) {
      await this.stopRuntime(runtimeId);
    }
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-RT-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.runtime.service',
      correlationId: `COR-RT-${Date.now()}`,
      causationId: `CAU-RT-${Date.now()}`,
      payload,
      // Phase 4 Event standard fields
      runtimeId: payload.runtimeId,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
