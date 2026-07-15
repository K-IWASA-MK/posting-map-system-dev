import { AutonomousSession } from './AutonomousSession';
import { ImprovementProposal } from './models/ImprovementProposal';

export interface AutonomousContext {
    contextId: string;
    session: AutonomousSession;
    proposal: ImprovementProposal;
}
