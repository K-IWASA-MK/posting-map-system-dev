import { MemoryObject } from '../MemoryObject';

export interface IMemoryConsumer {
    readonly consumerId: string;
    
    consumeMemory(memories: MemoryObject[]): Promise<void>;
}
