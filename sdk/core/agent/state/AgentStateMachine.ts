export type AgentState = 'PENDING' | 'THINKING' | 'PLANNING' | 'REVIEWING' | 'REFLECTING' | 'COMPLETED' | 'FAILED';

export class AgentStateMachine {
    private state: AgentState = 'PENDING';

    public getState(): AgentState {
        return this.state;
    }

    public transitionTo(newState: AgentState): void {
        // Validations can be added here
        this.state = newState;
    }
}
