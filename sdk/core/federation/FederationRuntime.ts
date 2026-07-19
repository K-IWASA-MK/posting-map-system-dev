import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { FederationManifest } from './FederationManifest';
import { FederationRegistry } from './FederationRegistry';
import { FederationPolicyResolver } from './FederationPolicyResolver';
import { FederationDomainProfile, FederationSession, FederationSessionStatus } from './FederationModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class FederationRuntime implements IRuntime<FederationManifest, void> {
  public readonly id = 'aios.federation';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Federation Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.FEDERATION],
    dependencies: []
  };

  private readonly registry = new FederationRegistry();
  private readonly policyResolver = new FederationPolicyResolver();
  private context?: RuntimeContext;
  public manifest?: FederationManifest;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Federation Domain Registry is active',
      lastChecked: new Date().toISOString(),
      message: 'Federation Domain Registry is active'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(manifest: FederationManifest): Promise<void> {
    if (!manifest.federationId || !manifest.configuration) {
      throw new Error('Invalid FederationManifest: Missing configuration');
    }
  }

  public async execute(manifest: FederationManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async registerDomain(profile: FederationDomainProfile): Promise<void> {
    this.registry.registerDomain(profile);
    await this.publishEvent('DomainRegistered', {
      domainId: profile.domainId,
      domainType: profile.domainType,
      state: RuntimeState.RUNNING
    });
  }

  public async establishSession(domainId: string, timeoutMs = 3600000): Promise<FederationSession> {
    const profile = this.registry.getDomainProfile(domainId);
    if (!profile) {
      throw new Error(`Domain ${domainId} is not registered`);
    }

    // Check policy resolution
    const allowed = this.policyResolver.validateDomainAccess(profile, 'POL-FED-STRICT');
    if (!allowed) {
      throw new Error(`Access denied for domain ${domainId} under strict policy check`);
    }

    const sessionId = `SES-FED-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const session: FederationSession = {
      sessionId,
      domainId,
      status: 'AUTHENTICATED',
      expiresAt: Date.now() + timeoutMs,
      establishedAt: Date.now(),
      mutualAuthStatus: 'ESTABLISHED'
    };

    this.registry.createSession(session);
    
    await this.publishEvent('FederationSessionCreated', {
      sessionId,
      domainId,
      state: RuntimeState.RUNNING
    });

    this.registry.updateSessionStatus(sessionId, 'ESTABLISHED');

    return this.registry.getSession(sessionId)!;
  }

  public async terminateSession(sessionId: string): Promise<void> {
    const session = this.registry.getSession(sessionId);
    if (session) {
      this.registry.terminateSession(sessionId);
      await this.publishEvent('FederationSessionTerminated', {
        sessionId,
        domainId: session.domainId,
        state: RuntimeState.RUNNING
      });
    }
  }

  public getRegistry(): FederationRegistry {
    return this.registry;
  }

  public getPolicyResolver(): FederationPolicyResolver {
    return this.policyResolver;
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-FD-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-FD-${Date.now()}`,
      causationId: `CAU-FD-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
