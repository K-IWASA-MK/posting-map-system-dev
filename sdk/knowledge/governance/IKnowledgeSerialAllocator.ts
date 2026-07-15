export interface IKnowledgeSerialAllocator {
  allocate(type: string): Promise<number>;
}
