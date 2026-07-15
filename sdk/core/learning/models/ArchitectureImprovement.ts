import { ImprovementProposal } from './ImprovementProposal';

export interface ArchitectureImprovement extends ImprovementProposal {
    targetComponentId: string;
    designFlawIdentified: string;
    proposedRefactor: string;
}
