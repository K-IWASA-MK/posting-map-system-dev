import { ProfileViolationException, HealthCheckFailedException, SessionExpiredException, CDPConnectionException } from '../exceptions/BrowserRuntimeExceptions';
import { BrowserRuntimeState } from '../types/BrowserRuntimeState';
import { BrowserSessionModel } from '../types/BrowserSessionModel';

export interface PolicyEvaluationResult {
  passed: boolean;
  violations: string[];
}

export class BrowserRuntimePolicy {
  public static validateProfile(profileName: string): void {
    if (profileName.includes('CEO') || profileName.includes('Personal')) {
      throw new ProfileViolationException(`Access to forbidden profile '${profileName}' is strictly prohibited by Rule BR-002.`);
    }
    if (profileName !== 'AI Employee Profile') {
      throw new ProfileViolationException(`AI employees may ONLY use 'AI Employee Profile'. Requested: '${profileName}'.`);
    }
  }

  public static validateHealth(state: BrowserRuntimeState, healthScore: number): void {
    if (state === BrowserRuntimeState.ERROR || state === BrowserRuntimeState.DEGRADED) {
      throw new HealthCheckFailedException(`Browser runtime health check failed. State: ${state}, Score: ${healthScore}`);
    }
  }

  public static validateSession(session: BrowserSessionModel): void {
    if (!session.sessionValid) {
      throw new SessionExpiredException('Session validation failed. User is not authenticated in required services.');
    }
  }

  public static validateCDPEndpoint(cdpEndpoint: string | null, isCdpRequired: boolean): void {
    if (isCdpRequired && !cdpEndpoint) {
      throw new CDPConnectionException('CDP_REQUIRED policy violation: CDP Endpoint is null or unavailable.');
    }
  }
}
