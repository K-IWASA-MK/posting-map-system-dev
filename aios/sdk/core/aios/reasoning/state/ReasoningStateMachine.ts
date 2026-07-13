import { ReasoningSession } from '../ReasoningSession';
import { ReasoningState } from '../ReasoningState';

export class ReasoningStateMachine {
    private validTransitions: Record<string, ReasoningState[]> = {
        [ReasoningState.CREATED]: [ReasoningState.COLLECTING_EVIDENCE],
        [ReasoningState.COLLECTING_EVIDENCE]: [ReasoningState.GENERATING_HYPOTHESIS, ReasoningState.ARCHIVED],
        [ReasoningState.GENERATING_HYPOTHESIS]: [ReasoningState.EVALUATING, ReasoningState.ARCHIVED],
        [ReasoningState.EVALUATING]: [ReasoningState.DECIDED, ReasoningState.COLLECTING_EVIDENCE, ReasoningState.ARCHIVED],
        [ReasoningState.DECIDED]: [ReasoningState.VALIDATED, ReasoningState.ARCHIVED],
        [ReasoningState.VALIDATED]: [ReasoningState.ARCHIVED],
        [ReasoningState.ARCHIVED]: []
    };

    public transition(session: ReasoningSession, nextState: ReasoningState): void {
        const currentState = session.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid reasoning transition from ${currentState} to ${nextState}`);
        }
        
        session.status = nextState;
    }
}
