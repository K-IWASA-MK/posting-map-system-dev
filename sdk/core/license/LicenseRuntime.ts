import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { LicenseManager } from './LicenseManager';
import { LicenseVerifier } from './LicenseVerifier';
import { LicenseRecord, LicenseState } from '../service/ServiceModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class LicenseRuntime implements IRuntime<void, void> {
  public readonly id = 'aios.license';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'License Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.LICENSE, RuntimeCapability.SUBSCRIPTION],
    dependencies: []
  };

  private readonly manager = new LicenseManager();
  private readonly verifier = new LicenseVerifier();
  private context?: RuntimeContext;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'License verification broker is running',
      lastChecked: new Date().toISOString(),
      message: 'License verification broker is running'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(): Promise<void> {}
  public async execute(): Promise<void> {}
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public getManager(): LicenseManager {
    return this.manager;
  }

  public getVerifier(): LicenseVerifier {
    return this.verifier;
  }

  public async issueLicense(licenseId: string, serviceId: string, licenseeId: string, durationMs = 86400000): Promise<LicenseRecord> {
    const record = this.manager.issueLicense(licenseId, serviceId, licenseeId, durationMs);
    
    await this.publishEvent('LicenseIssued', {
      licenseId,
      serviceId,
      licenseeId,
      state: RuntimeState.RUNNING
    });

    this.manager.updateLicenseStatus(licenseId, 'ACTIVE');
    
    await this.publishEvent('SubscriptionActivated', {
      subscriptionId: licenseId,
      serviceId,
      licenseeId,
      state: RuntimeState.RUNNING
    });

    return this.manager.getLicense(licenseId)!;
  }

  public async validateLicense(licenseId: string): Promise<boolean> {
    const l = this.manager.getLicense(licenseId);
    if (!l) return false;

    const valid = this.verifier.verify(l);
    
    await this.publishEvent('LicenseValidated', {
      licenseId,
      valid,
      state: RuntimeState.RUNNING
    });

    return valid;
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-LC-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-LC-${Date.now()}`,
      causationId: `CAU-LC-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
