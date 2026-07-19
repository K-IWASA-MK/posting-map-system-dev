import { FederationDomainProfile, FederationSession, FederationSessionStatus } from './FederationModels';

export class FederationRegistry {
  private profiles = new Map<string, FederationDomainProfile>();
  private sessions = new Map<string, FederationSession>();

  public registerDomain(profile: FederationDomainProfile): void {
    this.profiles.set(profile.domainId, profile);
  }

  public getDomainProfile(domainId: string): FederationDomainProfile | undefined {
    return this.profiles.get(domainId);
  }

  public createSession(session: FederationSession): void {
    this.sessions.set(session.sessionId, session);
  }

  public getSession(sessionId: string): FederationSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getSessionByDomain(domainId: string): FederationSession | undefined {
    return Array.from(this.sessions.values()).find(
      s => s.domainId === domainId && s.status !== 'TERMINATED'
    );
  }

  public terminateSession(sessionId: string): void {
    const s = this.sessions.get(sessionId);
    if (s) {
      this.sessions.set(sessionId, {
        ...s,
        status: 'TERMINATED'
      });
    }
  }

  public updateSessionStatus(sessionId: string, status: FederationSessionStatus): void {
    const s = this.sessions.get(sessionId);
    if (s) {
      this.sessions.set(sessionId, {
        ...s,
        status
      });
    }
  }

  public getDomains(): FederationDomainProfile[] {
    return Array.from(this.profiles.values());
  }

  public getActiveSessions(): FederationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status !== 'TERMINATED');
  }
}
