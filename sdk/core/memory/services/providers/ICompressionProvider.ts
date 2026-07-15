import { MemoryObject } from '../../MemoryObject';

export interface ICompressionProvider {
    readonly providerId: string;
    
    compress(memory: MemoryObject): Promise<string>;
    canCompress(memory: MemoryObject): boolean;
}
