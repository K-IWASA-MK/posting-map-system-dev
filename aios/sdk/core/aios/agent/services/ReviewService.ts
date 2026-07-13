import { IReasoningEngine } from '../reasoning/IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export class ReviewService {
    constructor(private engine: IReasoningEngine) {}

    public async reviewArtifact(context: AgentContext, profile: AgentProfile, artifactContent: string): Promise<string> {
        const result = await this.engine.reason(context, profile, `Review the following artifact: ${artifactContent}`);
        return result.finalConclusion;
    }
}
