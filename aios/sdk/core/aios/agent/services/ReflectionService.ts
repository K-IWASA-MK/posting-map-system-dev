import { IReasoningEngine } from '../reasoning/IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export class ReflectionService {
    constructor(private engine: IReasoningEngine) {}

    public async reflectOnExecution(context: AgentContext, profile: AgentProfile, history: any[]): Promise<string> {
        const historyStr = JSON.stringify(history);
        const result = await this.engine.reason(context, profile, `Reflect on this execution history and extract learnings: ${historyStr}`);
        return result.finalConclusion;
    }
}
