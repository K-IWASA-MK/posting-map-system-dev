import { KnowledgeObject } from '../KnowledgeObject';

export class KnowledgeStateMachine {
    private validTransitions: Record<string, string[]> = {
        'DRAFT': ['VERIFIED', 'DEPRECATED', 'ARCHIVED'],
        'VERIFIED': ['APPROVED', 'DEPRECATED', 'ARCHIVED'],
        'APPROVED': ['REUSABLE', 'DEPRECATED', 'ARCHIVED'],
        'REUSABLE': ['DEPRECATED', 'ARCHIVED'],
        'DEPRECATED': ['ARCHIVED'],
        'ARCHIVED': []
    };

    public transition(knowledge: KnowledgeObject, nextState: string): void {
        const currentState = knowledge.version.status;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid knowledge transition from ${currentState} to ${nextState}`);
        }
    }
}
