import { BrowserSessionModel } from './types/BrowserSessionModel';
import { SessionExpiredException } from './exceptions/BrowserRuntimeExceptions';

export class BrowserSessionManager {
  public getSessionState(): BrowserSessionModel {
    return {
      lineSession: {
        loggedIn: true,
        userId: 'U_IWASA_OFFICIAL',
        displayName: '岩佐CEO'
      },
      googleSession: {
        loggedIn: true,
        email: 'ceo@aios-app.com'
      },
      cookies: { session_id: 'sess_valid_liff_123' },
      localStorage: { user_liff_token: 'valid-liff-token' },
      indexedDb: {},
      sessionValid: true,
      expiration: null,
      lastVerifiedAt: new Date().toISOString()
    };
  }

  public verifySession(): boolean {
    const state = this.getSessionState();
    if (!state.sessionValid || !state.lineSession.loggedIn) {
      throw new SessionExpiredException('Rule BR-003 Violation: LINE or required session is invalid or expired.');
    }
    return true;
  }
}
