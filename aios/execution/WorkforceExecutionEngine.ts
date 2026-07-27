import { AIAssignmentContract } from '../workforce/AIAssignmentContract';
import { 
  AgentTaskPromptContext, 
  WorkforceExecutionResult, 
  ExecutionStepResult, 
  ExecutionStatus,
  SandboxAccessRequest 
} from './WorkforceExecutionTypes';
import { SandboxBoundaryEnforcer } from './SandboxBoundaryEnforcer';
import { RecoveryPolicyEngine } from './RecoveryPolicyEngine';
import { ExecutionLedgerAdapter } from './ExecutionLedgerAdapter';

export interface StepExecutorCallback {
  (
    stepNumber: number,
    capability: string,
    promptContext: AgentTaskPromptContext
  ): {
    accessRequest?: SandboxAccessRequest;
    outputSummary: string;
  };
}

export class WorkforceExecutionEngine {
  private readonly ledgerAdapter: ExecutionLedgerAdapter;

  constructor(ledgerAdapter?: ExecutionLedgerAdapter) {
    this.ledgerAdapter = ledgerAdapter || new ExecutionLedgerAdapter();
  }

  /**
   * Executes a task defined by an AIAssignmentContract in an ephemeral (1 Task = 1 Runtime) sandbox session.
   */
  public executeTask(
    contract: AIAssignmentContract,
    stepCallback?: StepExecutorCallback
  ): WorkforceExecutionResult {
    const executionId = `EXEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const contextHash = ExecutionLedgerAdapter.generateContextHash(contract);

    // 1. Build AgentTaskPromptContext
    const promptContext: AgentTaskPromptContext = {
      assignmentId: contract.assignmentId,
      taskId: contract.taskId,
      employeeId: contract.employeeId,
      projectId: contract.targetProjectId,
      taskObjective: contract.taskRequest.rawIntent,
      steps: contract.taskRequest.steps,
      allowedTools: contract.runtimePolicy.executionPermissions,
      sandboxBoundaries: contract.runtimePolicy.allowedPaths,
      taskLedgerRef: contract.decisionRecord.taskId,
      memorySnapshotRef: contract.memoryContextRef,
      executionPolicyRef: contract.runtimePolicy.sandboxRequired ? "POLICY-SANDBOX-STRICT" : "POLICY-STANDARD"
    };

    // Record STARTED Event
    this.ledgerAdapter.recordEvent(executionId, "STARTED", {
      assignmentId: contract.assignmentId,
      employeeId: contract.employeeId,
      contextHash
    });

    let currentStatus: ExecutionStatus = "RUNNING";
    const stepResults: ExecutionStepResult[] = [];
    let violationCount = 0;
    const riskLevel = contract.taskRequest.priority === "HIGH" || contract.taskRequest.priority === "CRITICAL"
      ? "HIGH"
      : "LOW";

    for (const step of contract.taskRequest.steps) {
      if ((currentStatus as ExecutionStatus) === "INTERCEPTED" || (currentStatus as ExecutionStatus) === "FAILED") {
        break;
      }

      // Simulate Step Execution & Access Request
      const callbackResult = stepCallback 
        ? stepCallback(step.stepNumber, step.requiredCapability, promptContext)
        : { outputSummary: `Step ${step.stepNumber} executed successfully.` };

      // Validate Access Request via SandboxBoundaryEnforcer
      if (callbackResult.accessRequest) {
        const validation = SandboxBoundaryEnforcer.validateAccess(
          callbackResult.accessRequest,
          contract.runtimePolicy.allowedPaths,
          contract.runtimePolicy.executionPermissions
        );

        if (!validation.allowed) {
          violationCount++;
          // Record SANDBOX_VIOLATION Event
          this.ledgerAdapter.recordEvent(executionId, "SANDBOX_VIOLATION", {
            stepNumber: step.stepNumber,
            accessRequest: callbackResult.accessRequest,
            reason: validation.reason,
            violationType: validation.violationType
          });

          // Resolve decision via RecoveryPolicyEngine
          const recovery = RecoveryPolicyEngine.resolveDecision(validation, riskLevel, violationCount - 1);

          if (recovery.action === "HALT") {
            currentStatus = "INTERCEPTED";
            this.ledgerAdapter.recordEvent(executionId, "FAILED", {
              reason: recovery.reason,
              stepNumber: step.stepNumber
            });
            stepResults.push({
              stepNumber: step.stepNumber,
              status: "INTERCEPTED",
              outputSummary: callbackResult.outputSummary,
              error: recovery.reason
            });
            break;
          } else if (recovery.action === "RETRY") {
            currentStatus = "WAITING_RETRY";
            this.ledgerAdapter.recordEvent(executionId, "RETRY", {
              reason: recovery.reason,
              stepNumber: step.stepNumber
            });
            stepResults.push({
              stepNumber: step.stepNumber,
              status: "RETRY_WARNING",
              outputSummary: `Warning Retry issued for step ${step.stepNumber}: ${recovery.reason}`
            });

            // Simulate second attempt (retry succeeds if callback behaves)
            currentStatus = "RUNNING";
          }
        }
      }

      if (currentStatus === "RUNNING") {
        stepResults.push({
          stepNumber: step.stepNumber,
          status: "PASSED",
          outputSummary: callbackResult.outputSummary
        });

        this.ledgerAdapter.recordEvent(executionId, "STEP_COMPLETED", {
          stepNumber: step.stepNumber,
          summary: callbackResult.outputSummary
        });
      }
    }

    if (currentStatus === "RUNNING") {
      currentStatus = "COMPLETED";
      this.ledgerAdapter.recordEvent(executionId, "COMPLETED", {
        totalSteps: stepResults.length
      });
    }

    const events = this.ledgerAdapter.getEvents(executionId);

    return {
      executionId,
      assignmentId: contract.assignmentId,
      taskId: contract.taskId,
      employeeId: contract.employeeId,
      projectId: contract.targetProjectId,
      status: currentStatus,
      stepResults,
      events,
      executionContextHash: contextHash,
      violationsCount: violationCount,
      executedAt: Date.now()
    };
  }

  public getLedgerAdapter(): ExecutionLedgerAdapter {
    return this.ledgerAdapter;
  }
}
