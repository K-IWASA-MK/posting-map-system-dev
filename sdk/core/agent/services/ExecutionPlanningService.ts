import { IReasoningEngine } from '../reasoning/IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export class ExecutionPlanningService {
    constructor(private engine: IReasoningEngine) {}

    public async generateExecutionPlan(context: AgentContext, profile: AgentProfile, plan: string): Promise<string> {
        const result = await this.engine.reason(context, profile, `Create executable steps from this plan: ${plan}`);
        return result.finalConclusion;
    }
}
