export interface SecurityContext {
  readonly contextId: string;
  readonly runtimeId: string;
  readonly pluginId?: string;
  readonly principalId: string;
  readonly sessionId: string;
  readonly sandboxId?: string;
  readonly trustLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly capabilities: string[];
}

export interface CapabilityToken {
  readonly tokenId: string;
  readonly principalId: string;
  readonly capabilities: string[];
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly revoked: boolean;
}

export interface AuthorizationDecision {
  readonly decisionId: string;
  readonly principalId: string;
  readonly resource: string;
  readonly action: string;
  readonly result: 'ALLOW' | 'DENY';
  readonly reason: string;
  readonly timestamp: string;
}

export interface SecretAccessDecision {
  readonly secretId: string;
  readonly principalId: string;
  readonly runtimeId: string;
  readonly result: 'ALLOW' | 'DENY';
  readonly reason: string;
  readonly timestamp: string;
}

export interface SecurityAuditRecord {
  readonly auditId: string;
  readonly runtimeId: string;
  readonly pluginId?: string;
  readonly event: string;
  readonly severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  readonly timestamp: string;
}
