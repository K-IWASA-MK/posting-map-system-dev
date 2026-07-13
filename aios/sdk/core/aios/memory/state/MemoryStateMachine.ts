import { MemoryObject } from '../MemoryObject';
import { MemoryState } from '../MemoryState';

export class MemoryStateMachine {
    private validTransitions: Record<string, MemoryState[]> = {
        [MemoryState.CREATED]: [MemoryState.ACTIVE, MemoryState.EXPIRED],
        [MemoryState.ACTIVE]: [MemoryState.REFERENCED, MemoryState.COMPRESSED, MemoryState.ARCHIVED, MemoryState.EXPIRED],
        [MemoryState.REFERENCED]: [MemoryState.ACTIVE, MemoryState.COMPRESSED, MemoryState.ARCHIVED, MemoryState.EXPIRED],
        [MemoryState.COMPRESSED]: [MemoryState.REFERENCED, MemoryState.ARCHIVED, MemoryState.EXPIRED],
        [MemoryState.ARCHIVED]: [MemoryState.EXPIRED],
        [MemoryState.EXPIRED]: []
    };

    public transition(memory: MemoryObject, nextState: MemoryState): void {
        const currentState = memory.state;
        const allowed = this.validTransitions[currentState];

        if (!allowed || !allowed.includes(nextState)) {
            throw new Error(`Invalid memory transition from ${currentState} to ${nextState}`);
        }
    }
}
