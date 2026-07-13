import { ReasoningSession } from './ReasoningSession';

export class ReasoningRegistry {
    private sessions: Map<string, ReasoningSession> = new Map();

    public registerSession(session: ReasoningSession): void {
        this.sessions.set(session.sessionId, session);
    }

    public getSession(sessionId: string): ReasoningSession | undefined {
        return this.sessions.get(sessionId);
    }

    public getActiveSessions(): ReasoningSession[] {
        return Array.from(this.sessions.values()).filter(s => 
            s.status !== 'ARCHIVED' && s.status !== 'VALIDATED'
        );
    }
}
