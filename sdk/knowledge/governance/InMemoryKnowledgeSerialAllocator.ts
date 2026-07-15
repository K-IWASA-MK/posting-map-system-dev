import { IKnowledgeSerialAllocator } from './IKnowledgeSerialAllocator';

export class InMemoryKnowledgeSerialAllocator implements IKnowledgeSerialAllocator {
  private readonly serials = new Map<string, number>();

  public async allocate(type: string): Promise<number> {
    const current = this.serials.get(type) || 0;
    const next = current + 1;
    this.serials.set(type, next);
    return next;
  }
}
