import { GovernanceState } from '../GovernanceState';
import { GovernanceSession } from '../GovernanceSession';

export class GovernanceStateMachine {
    private validTransitions: Record<string, GovernanceState[]> = {
        [GovernanceState.CREATED]: [GovernanceState.EVALUATING_POLICY],
        [GovernanceState.EVALUATING_POLICY]: [GovernanceState.ANALYZING_IMPACT, GovernanceState.REJECTED],
        [GovernanceState.ANALYZING_IMPACT]: [GovernanceState.VALIDATING_COMPLIANCE],
        [GovernanceState.VALIDATING_COMPLIANCE]: [GovernanceState.DECIDING],
        [GovernanceState.DECIDING]: [GovernanceState.APPROVED, GovernanceState.REJECTED, GovernanceState.DEFERRED],
        [GovernanceState.APPROVED]: [GovernanceState.CONDITION_CHECKED],
        [GovernanceState.CONDITION_CHECKED]: [GovernanceState.ENFORCING],
        [GovernanceState.ENFORCING]: [GovernanceState.ARCHIVED],
        [GovernanceState.REJECTED]: [GovernanceState.ARCHIVED],
        [GovernanceState.DEFERRED]: [GovernanceState.ARCHIVED],
        [GovernanceState.ARCHIVED]: []
    };

    public transition(session: GovernanceSession, nextState: GovernanceState): void {
        const currentState = session.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
        }

        session.status = nextState;
    }
}
