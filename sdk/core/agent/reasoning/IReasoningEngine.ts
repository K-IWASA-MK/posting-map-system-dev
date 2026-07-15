import { AgentContext } from '../AgentContext';
import { AgentProfile } from '../AgentProfile';

export interface ReasoningStep {
    stepId: string;
    description: string;
    thoughtProcess: string;
    conclusion: string;
}

export interface ReasoningResult {
    steps: ReasoningStep[];
    finalConclusion: string;
    confidence: number;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface IReasoningEngine {
    name: string;
    reason(context: AgentContext, profile: AgentProfile, taskDescription: string): Promise<ReasoningResult>;
}
