import { Decision } from './models/Decision';

export class ReasoningCache {
    private cache: Map<string, Decision> = new Map();

    public set(key: string, decision: Decision): void {
        this.cache.set(key, decision);
    }

    public get(key: string): Decision | undefined {
        return this.cache.get(key);
    }

    public generateKey(goalId: string, constraintsHash: string, memoryHash: string, knowledgeHash: string): string {
        return `${goalId}:${constraintsHash}:${memoryHash}:${knowledgeHash}`;
    }
}
