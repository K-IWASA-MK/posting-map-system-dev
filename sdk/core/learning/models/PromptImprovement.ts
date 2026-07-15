import { ImprovementProposal } from './ImprovementProposal';

export interface PromptImprovement extends ImprovementProposal {
    targetPromptId: string;
    suggestedChanges: string;
    expectedGain: string;
}
