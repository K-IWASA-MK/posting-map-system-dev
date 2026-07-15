import { IReasoningEngine, ReasoningResult } from '../reasoning/IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export class ReasoningService {
    constructor(private engine: IReasoningEngine) {}

    public async executeReasoning(context: AgentContext, profile: AgentProfile, task: string): Promise<ReasoningResult> {
        // Here we could add pre-processing, policy checks
        const result = await this.engine.reason(context, profile, task);
        return result;
    }
}
