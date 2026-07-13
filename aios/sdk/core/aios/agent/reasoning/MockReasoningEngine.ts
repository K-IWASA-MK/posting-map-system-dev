import { IReasoningEngine, ReasoningResult } from './IReasoningEngine';
import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';
import { ILLMProvider } from '../providers/ILLMProvider';

export class MockReasoningEngine implements IReasoningEngine {
    name = 'MockReasoningEngine';

    constructor(private provider: ILLMProvider) {}

    public async reason(context: AgentContext, profile: AgentProfile, taskDescription: string): Promise<ReasoningResult> {
        // Use the provider to simulate reasoning
        const response = await this.provider.generate({
            systemPrompt: profile.systemPrompt,
            prompt: `Reason about this task: ${taskDescription}`,
            temperature: profile.policy.temperature
        });

        return {
            steps: [
                {
                    stepId: 'step-1',
                    description: 'Analyze input',
                    thoughtProcess: 'Breaking down the task...',
                    conclusion: 'Task understood.'
                }
            ],
            finalConclusion: response.content,
            confidence: 0.95,
            usage: response.usage
        };
    }
}
