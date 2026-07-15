import { SchedulingStateMachine } from "./SchedulingStateMachine";
import { DependencyEngine } from "./DependencyEngine";
import { PrioritizationEngine } from "./PrioritizationEngine";
import { DispatchEngine } from "./DispatchEngine";
import { SchedulingContext } from "./SchedulingContext";
import { ScheduleStrategy } from "./ScheduleStrategy";
import { SchedulingPolicy } from "./SchedulingPolicy";
import { SchedulingState } from "./SchedulingState";

export class AdaptiveSchedulingRuntime {
  constructor(
    private stateMachine: SchedulingStateMachine,
    private dependencyEngine: DependencyEngine,
    private prioritizationEngine: PrioritizationEngine,
    private dispatchEngine: DispatchEngine
  ) {}

  public async scheduleTask(
    context: SchedulingContext,
    strategy: ScheduleStrategy,
    policy: SchedulingPolicy,
    simulatePreemption: boolean = false,
    simulateTimeout: boolean = false
  ): Promise<void> {
    try {
      this.stateMachine.transition(SchedulingState.ENQUEUING);
      
      this.stateMachine.transition(SchedulingState.RESOLVING_DEPENDENCIES);
      const depsResolved = this.dependencyEngine.resolveDependencies(context);
      
      this.stateMachine.transition(SchedulingState.CHECKING_CONSTRAINTS);
      const constraintsChecked = this.dependencyEngine.checkConstraints(context, {
        mustRunAfter: [], mustRunBefore: [], exclusive: false, coLocateWith: [], antiAffinity: []
      });
      
      this.stateMachine.transition(SchedulingState.PRIORITIZING);
      const queue = [context];
      const prioritizedQueue = this.prioritizationEngine.prioritize(queue, strategy, policy);
      
      this.stateMachine.transition(SchedulingState.ALLOCATING_TICKET);
      const ticket = this.dispatchEngine.allocateTicket(prioritizedQueue[0]);
      
      this.stateMachine.transition(SchedulingState.DISPATCHING);
      const decision = this.dispatchEngine.dispatch(ticket);
      
      this.stateMachine.transition(SchedulingState.WAITING_EXECUTION);
      
      if (simulatePreemption) {
        this.stateMachine.transition(SchedulingState.PREEMPTED);
        this.stateMachine.transition(SchedulingState.PRIORITIZING);
        this.stateMachine.transition(SchedulingState.ALLOCATING_TICKET);
        this.stateMachine.transition(SchedulingState.DISPATCHING);
        this.stateMachine.transition(SchedulingState.WAITING_EXECUTION);
      }
      
      if (simulateTimeout) {
        throw new Error("Deadline Missed");
      }
      
      this.stateMachine.transition(SchedulingState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== SchedulingState.FAILED && this.stateMachine.getState() !== SchedulingState.ARCHIVED) {
        this.stateMachine.transition(SchedulingState.FAILED);
        this.stateMachine.transition(SchedulingState.ARCHIVED);
      }
    }
  }
}
