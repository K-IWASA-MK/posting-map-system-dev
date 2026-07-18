import { AutonomousTriggerRequest } from "../contracts/AutonomousTriggerContract";
import { SprintProposal, AutonomousControlState } from "../contracts/AutonomousSprintContract";
import { AutonomousSecurityGate } from "../security/AutonomousSecurityGate";
import { SecretProvider } from "../security/SecretAccessPolicy";
import { AutonomousTriggerPolicy } from "../governance/AutonomousTriggerPolicy";
import { AutonomousExecutionBudget } from "../governance/AutonomousExecutionBudget";
import { AutonomousLoopGuard } from "../governance/AutonomousLoopGuard";
import { AutonomousApprovalPolicy } from "../governance/AutonomousApprovalPolicy";
import { SprintPlanner } from "../planner/SprintPlanner";
import { AutonomousExecutionTrace } from "../trace/AutonomousExecutionTrace";
import { RuntimeOrchestrator } from "../../orchestration/runtime/RuntimeOrchestrator";
import { RuntimeEvent } from "../../orchestration/contracts/RuntimeEventContract";
import { RuntimeEventBus } from "../../orchestration/events/RuntimeEventBus";

export class AutonomousExecutionController {
  private readonly securityGate: AutonomousSecurityGate;
  private readonly triggerPolicy: AutonomousTriggerPolicy;
  private readonly budget: AutonomousExecutionBudget;
  private readonly loopGuard: AutonomousLoopGuard;
  private readonly approvalPolicy: AutonomousApprovalPolicy;
  private readonly planner: SprintPlanner;
  private readonly trace: AutonomousExecutionTrace;
  private readonly orchestrator: RuntimeOrchestrator;
  private readonly eventBus: RuntimeEventBus;

  private controlState: AutonomousControlState = {
    enabled: true,
    emergencyStop: false,
    maxRiskLevel: "MEDIUM"
  };

  // Track pending approvals: proposalId -> proposal
  private readonly pendingApprovals = new Map<string, SprintProposal>();

  constructor(
    secretProvider: SecretProvider,
    eventBus: RuntimeEventBus,
    orchestrator: RuntimeOrchestrator,
    budget?: AutonomousExecutionBudget
  ) {
    this.eventBus = eventBus;
    this.orchestrator = orchestrator;
    this.securityGate = new AutonomousSecurityGate(secretProvider);
    this.triggerPolicy = new AutonomousTriggerPolicy();
    this.budget = budget || new AutonomousExecutionBudget();
    this.loopGuard = new AutonomousLoopGuard();
    this.approvalPolicy = new AutonomousApprovalPolicy();
    this.planner = new SprintPlanner();
    this.trace = new AutonomousExecutionTrace(eventBus);
  }

  /**
   * Emergency Kill Switch control.
   */
  public triggerEmergencyStop(reason: string): void {
    this.controlState = {
      ...this.controlState,
      emergencyStop: true
    };
    console.warn(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
  }

  public resetEmergencyStop(): void {
    this.controlState = {
      ...this.controlState,
      emergencyStop: false
    };
  }

  public setEnabled(enabled: boolean): void {
    this.controlState = {
      ...this.controlState,
      enabled
    };
  }

  /**
   * Main entry point to process and execute an autonomous trigger.
   */
  public async executeTrigger(request: AutonomousTriggerRequest): Promise<{
    success: boolean;
    reason?: string;
    approvalStatus?: "AUTO" | "REQUIRE_APPROVAL" | "BLOCK";
    proposal?: SprintProposal;
  }> {
    const correlationId = request.proposalId;

    // 1. Audit log: Trigger Received
    await this.trace.emit("AUTONOMOUS_TRIGGER_RECEIVED", correlationId, {
      triggerId: request.triggerId,
      requester: request.requester
    });

    // 2. Kill Switch / State Evaluation
    if (!this.controlState.enabled || this.controlState.emergencyStop) {
      const reason = this.controlState.emergencyStop
        ? "Emergency Kill Switch is active."
        : "Autonomous Controller is disabled.";
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason });
      return { success: false, reason, approvalStatus: "BLOCK" };
    }

    // 3. Security Gate (Signature verify, Data Leakage checks)
    const gateResult = await this.securityGate.processRequest(request);
    if (!gateResult.success) {
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason: gateResult.reason });
      return { success: false, reason: gateResult.reason, approvalStatus: "BLOCK" };
    }

    // 4. Formulate Proposal
    const proposal = this.planner.plan(request);

    // Risk validation against maxRiskLevel
    const riskLevels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    if (riskLevels[proposal.riskLevel] > riskLevels[this.controlState.maxRiskLevel]) {
      const reason = `Security Gate Block: Risk level ${proposal.riskLevel} exceeds maxRiskLevel: ${this.controlState.maxRiskLevel}`;
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason });
      return { success: false, reason, approvalStatus: "BLOCK" };
    }

    // 5. Policy Firewall (Target, scope, permissions check)
    const policyResult = this.triggerPolicy.evaluate(proposal);
    if (!policyResult.allowed) {
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason: policyResult.reason });
      return { success: false, reason: policyResult.reason, approvalStatus: "BLOCK" };
    }

    // 6. Budget Check
    const budgetResult = this.budget.evaluate({ newSprint: true, elapsedMinutes: 0 });
    if (!budgetResult.allowed) {
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason: budgetResult.reason });
      return { success: false, reason: budgetResult.reason, approvalStatus: "BLOCK" };
    }

    // 7. Loop Guard Check
    const loopResult = this.loopGuard.evaluate(proposal.proposalId);
    if (!loopResult.allowed) {
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason: loopResult.reason });
      // If we hit loop protection, trigger emergency stop to protect workspace safety
      this.triggerEmergencyStop(`Loop Guard Violation detected on proposal ${proposal.proposalId}`);
      return { success: false, reason: loopResult.reason, approvalStatus: "BLOCK" };
    }

    // 8. Human Override Approval Policy Check
    const approvalRoute = this.approvalPolicy.evaluateApproval(proposal.fileScope);
    if (approvalRoute === "BLOCK") {
      const reason = "Policy Firewall: Proposal requested system core/config edits which are BLOCKED for autonomous runs.";
      await this.trace.emit("AUTONOMOUS_EXECUTION_BLOCKED", correlationId, { reason });
      return { success: false, reason, approvalStatus: "BLOCK" };
    }

    if (approvalRoute === "REQUIRE_APPROVAL") {
      this.pendingApprovals.set(proposal.proposalId, proposal);
      await this.trace.emit("AUTONOMOUS_POLICY_APPROVED", correlationId, {
        status: "PENDING_HUMAN_APPROVAL",
        proposal
      });
      return {
        success: false,
        reason: "Sprint requires human approval before starting execution.",
        approvalStatus: "REQUIRE_APPROVAL",
        proposal
      };
    }

    // 9. Execute (AUTO approved)
    return this.startExecution(proposal);
  }

  /**
   * Executes a pending proposal after receiving human approval.
   */
  public async approveAndExecute(proposalId: string): Promise<{ success: boolean; reason?: string; proposal?: SprintProposal }> {
    const proposal = this.pendingApprovals.get(proposalId);
    if (!proposal) {
      return { success: false, reason: `No pending proposal found for ID: ${proposalId}` };
    }

    this.pendingApprovals.delete(proposalId);
    const result = await this.startExecution(proposal);
    return {
      success: result.success,
      reason: result.reason,
      proposal
    };
  }

  /**
   * Internal routine to execute the sprint proposal.
   */
  private async startExecution(proposal: SprintProposal): Promise<{ success: boolean; reason?: string; proposal?: SprintProposal }> {
    const correlationId = proposal.proposalId;

    // Apply Budget consumption
    this.budget.consume(true, 0, 0);

    // Apply Loop Guard tracking
    this.loopGuard.recordStart(proposal.proposalId);

    // Emit approval & execution start traces
    await this.trace.emit("AUTONOMOUS_POLICY_APPROVED", correlationId, { status: "APPROVED", proposal });
    await this.trace.emit("AUTONOMOUS_EXECUTION_STARTED", correlationId, { targetRuntime: proposal.targetRuntime });

    try {
      // Trigger execution via event routing on Orchestrator
      // Event: EXECUTION_COMPLETED wrapper or start trigger.
      // Orchestrator expects events conforming to RuntimeEvent. We send EXECUTION_COMPLETED to launch Validation etc.
      const initialEvent: RuntimeEvent = {
        eventId: `EV-INIT-${proposal.proposalId}`,
        eventType: "EXECUTION_COMPLETED",
        sourceRuntime: "ExecutionRuntime",
        timestamp: Date.now(),
        payload: {
          status: "COMPLETED",
          proposalId: proposal.proposalId,
          sprintName: proposal.sprintName
        },
        schemaVersion: "v1",
        correlationId
      };

      // Dispatches request through Orchestrator (Orchestrator -> EventBus -> Target)
      await this.orchestrator.orchestrate(initialEvent);

      await this.trace.emit("AUTONOMOUS_EXECUTION_COMPLETED", correlationId, { status: "SUCCESS" });
      this.loopGuard.recordResult(proposal.proposalId, "COMPLETED");

      return { success: true, proposal };
    } catch (error: any) {
      await this.trace.emit("AUTONOMOUS_EXECUTION_COMPLETED", correlationId, { status: "FAILED", error: error.message });
      this.loopGuard.recordResult(proposal.proposalId, "FAILED", error.message);
      return { success: false, reason: `Execution failure: ${error.message}`, proposal };
    }
  }

  // Getters for test verification
  public getControlState(): AutonomousControlState {
    return this.controlState;
  }

  public getTraceLogs() {
    return this.trace.getTraceLogs();
  }

  public getSecurityGate(): AutonomousSecurityGate {
    return this.securityGate;
  }

  public getLoopGuard(): AutonomousLoopGuard {
    return this.loopGuard;
  }

  public getBudget(): AutonomousExecutionBudget {
    return this.budget;
  }
}
