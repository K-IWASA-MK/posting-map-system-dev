import { MemoryObject } from '../MemoryObject';
import { MemoryType } from '../MemoryType';
import { MemoryScope } from '../MemoryScope';

export interface IMemoryProvider {
    readonly providerId: string;
    readonly supportedTypes: MemoryType[];
    readonly supportedScopes: MemoryScope[];
    
    provideMemory(query: string, scope: MemoryScope): Promise<MemoryObject[]>;
}
