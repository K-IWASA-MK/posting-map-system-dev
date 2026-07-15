import { LearningSession } from '../LearningSession';
import { LearningState } from '../LearningState';

export class LearningStateMachine {
    private validTransitions: Record<string, LearningState[]> = {
        [LearningState.CREATED]: [LearningState.COLLECTING_RESULTS],
        [LearningState.COLLECTING_RESULTS]: [LearningState.PATTERN_MINED, LearningState.ARCHIVED],
        [LearningState.PATTERN_MINED]: [LearningState.ANALYZING, LearningState.ARCHIVED],
        [LearningState.ANALYZING]: [LearningState.LEARNING, LearningState.ARCHIVED],
        [LearningState.LEARNING]: [LearningState.GENERATING_IMPROVEMENTS, LearningState.ARCHIVED],
        [LearningState.GENERATING_IMPROVEMENTS]: [LearningState.VALIDATING, LearningState.ARCHIVED],
        [LearningState.VALIDATING]: [LearningState.PROMOTED, LearningState.ARCHIVED],
        [LearningState.PROMOTED]: [LearningState.ARCHIVED],
        [LearningState.ARCHIVED]: []
    };

    public transition(session: LearningSession, nextState: LearningState): void {
        const currentState = session.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid learning transition from ${currentState} to ${nextState}`);
        }
        
        session.status = nextState;
    }
}
