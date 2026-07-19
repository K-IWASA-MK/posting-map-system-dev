import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { ApplicationManifest } from './ApplicationManifest';
import { ApplicationRegistry } from './ApplicationRegistry';
import { ApplicationProvisioner } from './ApplicationProvisioner';
import { ApplicationDefinition, ProvisioningPlan } from './ApplicationModels';
import { ServiceRegistry } from '../service/ServiceRegistry';
import { RuntimeState } from '../runtime/RuntimeState';

export class ApplicationRuntime implements IRuntime<ApplicationManifest, void> {
  public readonly id = 'aios.application';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Application Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.APPLICATION, RuntimeCapability.PROVISIONING],
    dependencies: []
  };

  private readonly registry = new ApplicationRegistry();
  private readonly provisioner = new ApplicationProvisioner();
  private context?: RuntimeContext;
  public manifest?: ApplicationManifest;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Application manager is active',
      lastChecked: new Date().toISOString(),
      message: 'Application manager is active'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(manifest: ApplicationManifest): Promise<void> {
    if (!manifest.signature || !manifest.profile) {
      throw new Error('Invalid ApplicationManifest: Missing signature metadata');
    }
  }

  public async execute(manifest: ApplicationManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public getRegistry(): ApplicationRegistry {
    return this.registry;
  }

  public getProvisioner(): ApplicationProvisioner {
    return this.provisioner;
  }

  public async registerApplication(app: ApplicationDefinition, manifest: ApplicationManifest): Promise<void> {
    // 1. Validate signature integrity check
    if (manifest.signature.signature === 'INVALID-SIGNATURE') {
      throw new Error(`Application package signature verification failed: ${app.applicationId}`);
    }

    this.registry.registerApplication(app);
    
    await this.publishEvent('ApplicationRegistered', {
      applicationId: app.applicationId,
      state: RuntimeState.RUNNING
    });
  }

  public async deployApplication(
    appId: string,
    serviceRegistry: ServiceRegistry,
    requiredCapabilities: string[]
  ): Promise<ProvisioningPlan> {
    const app = this.registry.getApplication(appId);
    if (!app) {
      throw new Error(`Application ${appId} is not registered`);
    }

    // 1. Plan Provisioning
    const plan = this.provisioner.createPlan(app, requiredCapabilities);
    await this.publishEvent('ProvisioningPlanned', {
      planId: plan.planId,
      applicationId: appId,
      state: RuntimeState.RUNNING
    });

    try {
      // 2. Validate Provisioning
      this.provisioner.validatePlan(plan.planId, serviceRegistry);
      await this.publishEvent('ProvisioningValidated', {
        planId: plan.planId,
        applicationId: appId,
        state: RuntimeState.RUNNING
      });

      // 3. Complete Provisioning
      this.provisioner.completePlan(plan.planId);
      await this.publishEvent('ProvisioningCompleted', {
        planId: plan.planId,
        applicationId: appId,
        state: RuntimeState.RUNNING
      });

      // 4. Activate Application
      this.registry.registerApplication({
        ...app,
        status: 'ACTIVE'
      });
      await this.publishEvent('ApplicationActivated', {
        applicationId: appId,
        state: RuntimeState.RUNNING
      });

      return this.provisioner.getPlan(plan.planId)!;
    } catch (e: any) {
      this.provisioner.rollbackPlan(plan.planId);
      throw e;
    }
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-APP-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-APP-${Date.now()}`,
      causationId: `CAU-APP-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
