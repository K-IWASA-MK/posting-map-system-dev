import { ReasoningContext } from '../ReasoningContext';
import { EvidenceSource } from '../models/EvidenceSource';
import { Goal } from '../models/Goal';
import { Constraint } from '../models/Constraint';

export class ReasoningResolver {
    public resolveRequest(goals: Goal[], constraints: Constraint[]): Partial<ReasoningContext> {
        // Converts incoming request into goals, assumptions and constraints for the Session.
        return {
            goals,
            constraints,
            assumptions: []
        };
    }

    public determineSources(goals: Goal[]): EvidenceSource[] {
        // Based on goals, decide where to look for evidence
        return [EvidenceSource.MEMORY, EvidenceSource.KNOWLEDGE, EvidenceSource.WORKFLOW];
    }
}
