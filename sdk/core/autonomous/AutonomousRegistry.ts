import { AutonomousSession } from './AutonomousSession';
import { ImprovementExecutionPlan } from './models/ImprovementExecutionPlan';

export class AutonomousRegistry {
    private sessions: Map<string, AutonomousSession> = new Map();
    private plans: Map<string, ImprovementExecutionPlan> = new Map();

    public registerSession(session: AutonomousSession): void {
        this.sessions.set(session.sessionId, session);
    }

    public getSession(sessionId: string): AutonomousSession | undefined {
        return this.sessions.get(sessionId);
    }

    public registerPlan(plan: ImprovementExecutionPlan): void {
        this.plans.set(plan.planId, plan);
    }

    public getPlan(planId: string): ImprovementExecutionPlan | undefined {
        return this.plans.get(planId);
    }
}
