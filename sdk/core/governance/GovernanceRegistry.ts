import { GovernanceSession } from './GovernanceSession';
import { GovernanceDecision } from './models/GovernanceDecision';
import { ImpactAnalysis } from './models/ImpactAnalysis';
import { ComplianceReport } from './models/ComplianceReport';

export class GovernanceRegistry {
    private sessions: Map<string, GovernanceSession> = new Map();
    private decisions: Map<string, GovernanceDecision> = new Map();
    private impacts: Map<string, ImpactAnalysis> = new Map();
    private compliance: Map<string, ComplianceReport> = new Map();

    public registerSession(session: GovernanceSession): void {
        this.sessions.set(session.sessionId, session);
    }

    public getSession(sessionId: string): GovernanceSession | undefined {
        return this.sessions.get(sessionId);
    }

    public registerDecision(decision: GovernanceDecision): void {
        this.decisions.set(decision.requestId, decision);
    }

    public registerImpact(impact: ImpactAnalysis): void {
        this.impacts.set(impact.requestId, impact);
    }

    public registerCompliance(report: ComplianceReport): void {
        this.compliance.set(report.requestId, report);
    }
}
