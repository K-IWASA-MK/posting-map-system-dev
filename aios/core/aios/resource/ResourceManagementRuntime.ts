import { ResourceStateMachine } from "./ResourceStateMachine";
import { CapacityMonitor } from "./CapacityMonitor";
import { AllocatorEngine } from "./AllocatorEngine";
import { SchedulingEngine } from "./SchedulingEngine";
import { ResourceValidator } from "./ResourceValidator";
import { ResourceRequirement } from "./ResourceRequirement";
import { AllocationStrategy } from "./AllocationStrategy";
import { ResourcePolicy } from "./ResourcePolicy";
import { QueuePriority } from "./QueuePriority";
import { ResourceState } from "./ResourceState";
import { ResourceQuota } from "./ResourceQuota";

export class ResourceManagementRuntime {
  constructor(
    private stateMachine: ResourceStateMachine,
    private monitor: CapacityMonitor,
    private allocator: AllocatorEngine,
    private scheduler: SchedulingEngine,
    private validator: ResourceValidator
  ) {}

  public async allocateResources(
    requirement: ResourceRequirement,
    strategy: AllocationStrategy,
    policy: ResourcePolicy,
    priority: QueuePriority,
    quota: ResourceQuota
  ): Promise<void> {
    try {
      this.stateMachine.transition(ResourceState.COLLECTING_REQUIREMENTS);
      
      this.stateMachine.transition(ResourceState.CHECKING_CAPACITY);
      const pool = await this.monitor.getAvailableCapacity();
      const health = await this.monitor.getHealthStatus();
      
      this.stateMachine.transition(ResourceState.CREATING_RESERVATION);
      const reservation = this.allocator.createReservation(requirement);
      
      this.stateMachine.transition(ResourceState.VALIDATING_RESERVATION);
      const isResValid = this.validator.validateReservation(requirement, pool, quota);
      if (!isResValid) {
        this.stateMachine.transition(ResourceState.ARCHIVED);
        return;
      }
      
      const claim = this.allocator.createClaim(reservation);
      
      this.stateMachine.transition(ResourceState.ALLOCATING_RESOURCES);
      const allocation = this.allocator.allocate(claim, strategy, policy);
      
      this.stateMachine.transition(ResourceState.VALIDATING_ALLOCATION);
      const isAllocValid = this.validator.validateAllocation(allocation, requirement);
      if (!isAllocValid) {
        this.stateMachine.transition(ResourceState.ARCHIVED);
        return;
      }
      
      this.stateMachine.transition(ResourceState.SCHEDULING);
      this.scheduler.schedule(allocation.allocationId, priority);
      
      this.stateMachine.transition(ResourceState.COMMITTING_RESOURCES);
      
      this.stateMachine.transition(ResourceState.READY);
      this.stateMachine.transition(ResourceState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== ResourceState.FAILED && this.stateMachine.getState() !== ResourceState.ARCHIVED) {
        this.stateMachine.transition(ResourceState.FAILED);
        this.stateMachine.transition(ResourceState.ARCHIVED);
      }
    }
  }
}
