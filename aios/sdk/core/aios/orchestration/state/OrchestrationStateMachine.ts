import { OrchestrationState } from '../OrchestrationState';
import { OrchestrationSession } from '../OrchestrationSession';

export class OrchestrationStateMachine {
    private validTransitions: Record<string, OrchestrationState[]> = {
        [OrchestrationState.CREATED]: [OrchestrationState.PLANNING],
        [OrchestrationState.PLANNING]: [OrchestrationState.SCHEDULING, OrchestrationState.FAILED],
        [OrchestrationState.SCHEDULING]: [OrchestrationState.READY, OrchestrationState.FAILED],
        [OrchestrationState.READY]: [OrchestrationState.DISPATCHING, OrchestrationState.CANCELLED],
        [OrchestrationState.DISPATCHING]: [OrchestrationState.EXECUTING, OrchestrationState.FAILED],
        [OrchestrationState.EXECUTING]: [
            OrchestrationState.COMPLETED,
            OrchestrationState.FAILED,
            OrchestrationState.PAUSED,
            OrchestrationState.CANCELLED
        ],
        [OrchestrationState.PAUSED]: [OrchestrationState.RESUMED, OrchestrationState.CANCELLED],
        [OrchestrationState.RESUMED]: [OrchestrationState.EXECUTING],
        [OrchestrationState.FAILED]: [OrchestrationState.RETRYING, OrchestrationState.CANCELLED],
        [OrchestrationState.RETRYING]: [OrchestrationState.EXECUTING, OrchestrationState.CANCELLED],
        [OrchestrationState.CANCELLED]: [OrchestrationState.ARCHIVED],
        [OrchestrationState.COMPLETED]: [OrchestrationState.ARCHIVED],
        [OrchestrationState.ARCHIVED]: []
    };

    public transition(session: OrchestrationSession, nextState: OrchestrationState): void {
        const currentState = session.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
        }

        session.status = nextState;
    }
}
