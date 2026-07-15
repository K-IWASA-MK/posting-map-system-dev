import { IReasoningEngine } from '../reasoning/IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export class PlanningService {
    constructor(private engine: IReasoningEngine) {}

    public async generatePlan(context: AgentContext, profile: AgentProfile, goal: string): Promise<string> {
        const result = await this.engine.reason(context, profile, `Generate a plan for: ${goal}`);
        return result.finalConclusion;
    }
}
