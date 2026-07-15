import { KnowledgeObject } from '../KnowledgeObject';
import { KnowledgeStateMachine } from '../state/KnowledgeStateMachine';

export class KnowledgeEvolutionService {
    constructor(private stateMachine: KnowledgeStateMachine) {}

    public async evolve(knowledge: KnowledgeObject, targetState: 'VERIFIED' | 'APPROVED' | 'REUSABLE' | 'DEPRECATED' | 'ARCHIVED'): Promise<void> {
        // Transition state
        this.stateMachine.transition(knowledge, targetState);
        knowledge.version.status = targetState;
        knowledge.version.revision += 1;
        knowledge.version.timestamp = new Date().toISOString();
        knowledge.updatedAt = new Date().toISOString();
    }
}
