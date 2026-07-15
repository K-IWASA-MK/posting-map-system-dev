import { ExecutionStateMachine } from "./ExecutionStateMachine";
import { TicketClaimEngine } from "./TicketClaimEngine";
import { ExecutionEngine } from "./ExecutionEngine";
import { RollbackEngine } from "./RollbackEngine";
import { ExecutionContext } from "./ExecutionContext";
import { ExecutionPlan } from "./ExecutionPlan";
import { ExecutionState } from "./ExecutionState";
import { SessionState } from "./SessionState";
import { ExecutionSession } from "./ExecutionSession";
import { CheckpointType } from "./ExecutionCheckpoint";
import { RollbackPolicy } from "./ExecutionPolicy";

export class ExecutionRuntime {
  constructor(
    private stateMachine: ExecutionStateMachine,
    private claimEngine: TicketClaimEngine,
    private executionEngine: ExecutionEngine,
    private rollbackEngine: RollbackEngine
  ) {}

  public async execute(
    context: ExecutionContext,
    plan: ExecutionPlan,
    simulateDoubleClaim: boolean = false,
    simulateFailure: boolean = false,
    simulateTimeout: boolean = false
  ): Promise<void> {
    try {
      this.stateMachine.transition(ExecutionState.CLAIMING_TICKET);
      if (simulateDoubleClaim || !this.claimEngine.claimTicket(context.ticketId)) {
        throw new Error("Double Claim Detected");
      }
      
      this.stateMachine.transition(ExecutionState.CREATING_SESSION);
      const session: ExecutionSession = {
        sessionId: `SESS-${Date.now()}`,
        ticketId: context.ticketId,
        runtimeId: "RUNTIME-1",
        startedAt: Date.now(),
        status: SessionState.CREATED
      };
      
      this.stateMachine.transition(ExecutionState.INITIALIZING);
      
      this.stateMachine.transition(ExecutionState.EXECUTING);
      if (plan.requiresCheckpoint) {
        this.stateMachine.transition(ExecutionState.CHECKPOINT);
        this.executionEngine.createCheckpoint(session, CheckpointType.BEFORE);
        this.stateMachine.transition(ExecutionState.EXECUTING);
      }

      if (simulateTimeout) {
        this.stateMachine.transition(ExecutionState.TIMEOUT);
        throw new Error("Execution Timeout");
      }

      if (simulateFailure) {
        throw new Error("Execution Failed");
      }
      
      await this.executionEngine.executePlan(session, plan);

      this.stateMachine.transition(ExecutionState.COMPLETING);
      this.stateMachine.transition(ExecutionState.COMPLETED);
      
    } catch (error: any) {
      if (this.stateMachine.getState() === ExecutionState.TIMEOUT) {
         this.stateMachine.transition(ExecutionState.ROLLBACK);
         this.stateMachine.transition(ExecutionState.ARCHIVED);
      } else if (this.stateMachine.getState() !== ExecutionState.FAILED && this.stateMachine.getState() !== ExecutionState.ARCHIVED) {
        this.stateMachine.transition(ExecutionState.FAILED);
        if (plan.rollbackSupported && error.message !== "Double Claim Detected") {
           this.stateMachine.transition(ExecutionState.ROLLBACK);
        }
        this.stateMachine.transition(ExecutionState.ARCHIVED);
      }
    }
  }
}
