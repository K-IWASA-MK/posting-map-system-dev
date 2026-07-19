import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { SecurityManifest } from './SecurityManifest';
import { SecurityPolicyRegistry } from './SecurityPolicyRegistry';
import { AuthorizationEngine } from './AuthorizationEngine';
import { SecurityContext, CapabilityToken, AuthorizationDecision, SecretAccessDecision, SecurityAuditRecord } from './SecurityModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class SecurityRuntime implements IRuntime<SecurityManifest, void> {
  public readonly id = 'aios.security';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Security Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.SECURITY],
    dependencies: []
  };

  private readonly registry = new SecurityPolicyRegistry();
  private readonly authEngine = new AuthorizationEngine(this.registry);
  private context?: RuntimeContext;
  public manifest?: SecurityManifest;

  private trustEngine?: any;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public setTrustEngine(trustEngine: any): void {
    this.trustEngine = trustEngine;
  }

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Security Broker Engine is active',
      lastChecked: new Date().toISOString(),
      message: 'Security Broker Engine is active'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(manifest: SecurityManifest): Promise<void> {
    if (!manifest.securityId || !manifest.configuration) {
      throw new Error('Invalid SecurityManifest: Missing configuration');
    }
  }

  public async execute(manifest: SecurityManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {
    await this.publishEvent('SecurityPolicyLoaded', {
      policyState: 'ACTIVE',
      state: RuntimeState.RUNNING
    });
  }

  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public generateToken(principalId: string, capabilities: string[], lifespanMs = 3600000): CapabilityToken {
    const token: CapabilityToken = {
      tokenId: `TOK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      principalId,
      capabilities,
      issuedAt: Date.now(),
      expiresAt: Date.now() + lifespanMs,
      revoked: false
    };
    this.registry.registerToken(token);
    return token;
  }

  public revokeToken(tokenId: string): void {
    this.registry.revokeToken(tokenId);
  }

  public async authorize(
    securityCtx: SecurityContext,
    resource: string,
    action: string,
    tokenId?: string
  ): Promise<AuthorizationDecision> {
    if (this.trustEngine && securityCtx.principalId.startsWith('ID-')) {
      try {
        const trustRecord = await this.trustEngine.evaluateTrust(securityCtx.principalId);
        if (trustRecord.trustScore < 70) {
          const decision: AuthorizationDecision = {
            decisionId: `DEC-AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            principalId: securityCtx.principalId,
            resource,
            action,
            result: 'DENY',
            reason: `Trust score ${trustRecord.trustScore} is below minimum passing threshold 70`,
            timestamp: new Date().toISOString()
          };
          await this.publishEvent('AuthorizationEvaluated', {
            decisionId: decision.decisionId,
            principalId: decision.principalId,
            result: decision.result,
            state: RuntimeState.RUNNING
          });
          await this.detectViolation(securityCtx, `Authorization Denied: Trust score below threshold`, 'CRITICAL');
          return decision;
        }
      } catch (e) {
        // ID not found, carry on with standard Auth
      }
    }

    const decision = this.authEngine.evaluateAuthorization(securityCtx, resource, action, tokenId);
    
    await this.publishEvent('AuthorizationEvaluated', {
      decisionId: decision.decisionId,
      principalId: decision.principalId,
      result: decision.result,
      state: RuntimeState.RUNNING
    });

    if (decision.result === 'DENY') {
      await this.detectViolation(securityCtx, `Authorization Denied: ${decision.reason}`, 'ERROR');
    }

    return decision;
  }

  public async getSecret(securityCtx: SecurityContext, secretId: string, tokenId?: string): Promise<string | undefined> {
    const decisionId = `DEC-SEC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let allowed = false;
    let reason = 'Unauthorized Secret Access Attempt';

    if (securityCtx.trustLevel === 'HIGH' || (tokenId && this.authEngine.evaluateAuthorization(securityCtx, 'secrets', 'read', tokenId).result === 'ALLOW')) {
      allowed = true;
      reason = 'Secret retrieval authorized';
    }

    const decision: SecretAccessDecision = {
      secretId,
      principalId: securityCtx.principalId,
      runtimeId: securityCtx.runtimeId,
      result: allowed ? 'ALLOW' : 'DENY',
      reason,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('SecretAccessEvaluated', {
      decisionId,
      secretId,
      result: decision.result,
      state: RuntimeState.RUNNING
    });

    if (!allowed) {
      await this.detectViolation(securityCtx, `Secret Access Denied for ${secretId}`, 'CRITICAL');
      return undefined;
    }

    return this.registry.getSecretValue(secretId);
  }

  public async detectViolation(securityCtx: SecurityContext, message: string, severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'): Promise<void> {
    const violationId = `VIOL-SEC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    await this.publishEvent('SecurityViolationDetected', {
      violationId,
      runtimeId: securityCtx.runtimeId,
      pluginId: securityCtx.pluginId,
      message,
      severity,
      state: RuntimeState.RUNNING
    });

    // Record to audit ledger
    await this.recordAudit(securityCtx, `Violation detected: ${message}`, severity);
  }

  public async recordAudit(securityCtx: SecurityContext, event: string, severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'): Promise<SecurityAuditRecord> {
    const record: SecurityAuditRecord = {
      auditId: `AUD-SEC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      runtimeId: securityCtx.runtimeId,
      pluginId: securityCtx.pluginId,
      event,
      severity,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('SecurityAuditRecorded', {
      auditId: record.auditId,
      event: record.event,
      severity: record.severity,
      state: RuntimeState.RUNNING
    });

    return record;
  }

  public getRegistry(): SecurityPolicyRegistry {
    return this.registry;
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-SC-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-SC-${Date.now()}`,
      causationId: `CAU-SC-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
