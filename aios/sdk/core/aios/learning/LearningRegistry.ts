import { LearningSession } from './LearningSession';
import { LearningPattern } from './models/LearningPattern';

export class LearningRegistry {
    private sessions: Map<string, LearningSession> = new Map();
    private patterns: Map<string, LearningPattern> = new Map();

    public registerSession(session: LearningSession): void {
        this.sessions.set(session.sessionId, session);
    }

    public getSession(sessionId: string): LearningSession | undefined {
        return this.sessions.get(sessionId);
    }

    public registerPattern(pattern: LearningPattern): void {
        this.patterns.set(pattern.patternId, pattern);
    }

    public getPatterns(): LearningPattern[] {
        return Array.from(this.patterns.values());
    }
}
