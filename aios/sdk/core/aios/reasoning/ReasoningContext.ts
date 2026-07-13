import { Goal } from './models/Goal';
import { Assumption } from './models/Assumption';
import { Constraint } from './models/Constraint';
import { ReasoningSession } from './ReasoningSession';

export interface ReasoningContext {
    contextId: string;
    session: ReasoningSession;
    goals: Goal[];
    assumptions: Assumption[];
    constraints: Constraint[];
}
