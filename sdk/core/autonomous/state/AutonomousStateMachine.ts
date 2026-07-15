import { AutonomousState } from '../AutonomousState';
import { AutonomousSession } from '../AutonomousSession';

export class AutonomousStateMachine {
    private validTransitions: Record<string, AutonomousState[]> = {
        [AutonomousState.CREATED]: [AutonomousState.EVALUATING],
        [AutonomousState.EVALUATING]: [AutonomousState.RISK_ANALYZED, AutonomousState.ROLLING_BACK], // Reject -> ROLLING_BACK
        [AutonomousState.RISK_ANALYZED]: [AutonomousState.PLANNED, AutonomousState.ROLLING_BACK],
        [AutonomousState.PLANNED]: [AutonomousState.APPROVED, AutonomousState.ROLLING_BACK],
        [AutonomousState.APPROVED]: [AutonomousState.EXECUTING, AutonomousState.ROLLING_BACK],
        [AutonomousState.EXECUTING]: [AutonomousState.VALIDATING, AutonomousState.ROLLING_BACK],
        [AutonomousState.VALIDATING]: [AutonomousState.VERIFIED, AutonomousState.ROLLING_BACK],
        [AutonomousState.VERIFIED]: [AutonomousState.PROMOTED, AutonomousState.ARCHIVED],
        [AutonomousState.PROMOTED]: [AutonomousState.ARCHIVED],
        [AutonomousState.ROLLING_BACK]: [AutonomousState.ARCHIVED],
        [AutonomousState.ARCHIVED]: []
    };

    public transition(session: AutonomousSession, nextState: AutonomousState): void {
        const currentState = session.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
        }

        session.status = nextState;
    }
}
