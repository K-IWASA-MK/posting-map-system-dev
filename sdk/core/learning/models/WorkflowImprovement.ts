import { ImprovementProposal } from './ImprovementProposal';

export interface WorkflowImprovement extends ImprovementProposal {
    targetWorkflowId: string;
    bottleneckIdentified: string;
    suggestedRouting: string;
}
