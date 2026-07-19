import { SecurityContext, CapabilityToken, AuthorizationDecision } from './SecurityModels';
import { SecurityPolicyRegistry } from './SecurityPolicyRegistry';

export class AuthorizationEngine {
  constructor(private readonly registry: SecurityPolicyRegistry) {}

  public evaluateAuthorization(
    context: SecurityContext,
    resource: string,
    action: string,
    tokenId?: string
  ): AuthorizationDecision {
    const decisionId = `DEC-AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Check if token is provided and check its status
    if (tokenId) {
      const token = this.registry.getToken(tokenId);
      if (!token) {
        return {
          decisionId,
          principalId: context.principalId,
          resource,
          action,
          result: 'DENY',
          reason: `Provided capability token ${tokenId} not found in registry`,
          timestamp: new Date().toISOString()
        };
      }

      if (token.revoked) {
        return {
          decisionId,
          principalId: context.principalId,
          resource,
          action,
          result: 'DENY',
          reason: 'Capability token has been explicitly revoked',
          timestamp: new Date().toISOString()
        };
      }

      if (Date.now() > token.expiresAt) {
        return {
          decisionId,
          principalId: context.principalId,
          resource,
          action,
          result: 'DENY',
          reason: 'Capability token has expired',
          timestamp: new Date().toISOString()
        };
      }

      // Token is valid; let's check capabilities
      const hasCapability = token.capabilities.includes('*') || token.capabilities.includes(`${resource}:${action}`);
      if (!hasCapability) {
        return {
          decisionId,
          principalId: context.principalId,
          resource,
          action,
          result: 'DENY',
          reason: `Token lacks capability matching ${resource}:${action}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        decisionId,
        principalId: context.principalId,
        resource,
        action,
        result: 'ALLOW',
        reason: 'Access authorized by valid capability token',
        timestamp: new Date().toISOString()
      };
    }

    // Default zero-trust evaluation: low trust context gets denied
    if (context.trustLevel === 'LOW') {
      return {
        decisionId,
        principalId: context.principalId,
        resource,
        action,
        result: 'DENY',
        reason: 'Low trust level context requires explicit authorization token',
        timestamp: new Date().toISOString()
      };
    }

    // High/Medium level without token checking global capability context
    const authorized = context.capabilities.includes('*') || context.capabilities.includes(`${resource}:${action}`);
    
    return {
      decisionId,
      principalId: context.principalId,
      resource,
      action,
      result: authorized ? 'ALLOW' : 'DENY',
      reason: authorized ? 'Permissions authorized by context capabilities' : 'Access denied by zero-trust default',
      timestamp: new Date().toISOString()
    };
  }
}
