import { OrchestrationRegistry } from '../OrchestrationRegistry';

export class QueueMonitor {
  constructor(private readonly registry: OrchestrationRegistry) {}

  public getQueueDepth(): number {
    return this.registry.listQueue().filter(item => item.status === 'PENDING').length;
  }
}
