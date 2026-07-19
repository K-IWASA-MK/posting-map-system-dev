import { OrchestrationPlan, ExecutionQueueItem, ResourceAllocation } from './models/OrchestrationModels';

export class OrchestrationRegistry {
  private plans = new Map<string, OrchestrationPlan>();
  private queue = new Map<string, ExecutionQueueItem>();
  private allocations = new Map<string, ResourceAllocation>();

  public registerPlan(plan: OrchestrationPlan): void {
    this.plans.set(plan.planId, plan);
  }

  public getPlan(planId: string): OrchestrationPlan | undefined {
    return this.plans.get(planId);
  }

  public getPlanByApplication(appId: string): OrchestrationPlan | undefined {
    return Array.from(this.plans.values()).find(p => p.applicationId === appId);
  }

  public registerQueueItem(item: ExecutionQueueItem): void {
    this.queue.set(item.queueId, item);
  }

  public getQueueItem(queueId: string): ExecutionQueueItem | undefined {
    return this.queue.get(queueId);
  }

  public listQueue(): ExecutionQueueItem[] {
    return Array.from(this.queue.values());
  }

  public registerAllocation(allocation: ResourceAllocation): void {
    this.allocations.set(allocation.allocationId, allocation);
  }

  public getAllocation(allocationId: string): ResourceAllocation | undefined {
    return this.allocations.get(allocationId);
  }
}
