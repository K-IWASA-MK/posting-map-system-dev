import { DevelopmentContext } from '../context/DevelopmentContext';
import { DevelopmentRuleEngine } from '../engine/DevelopmentRuleEngine';
import { ExecutionRecorder } from '../ledger/ExecutionRecorder';
import { ExecutionLedgerEntryType } from '../ledger/ExecutionLedgerEntryType';
import { DevelopmentGovernanceEngine } from '../governance/DevelopmentGovernanceEngine';
import { DevelopmentGovernanceResult } from '../governance/DevelopmentGovernanceResult';

export class ExecutionCoordinator {
  private engine: DevelopmentRuleEngine;
  private governance: DevelopmentGovernanceEngine;

  constructor(engine: DevelopmentRuleEngine, governance: DevelopmentGovernanceEngine) {
    this.engine = engine;
    this.governance = governance;
  }

  public async run(context: DevelopmentContext, recorder: ExecutionRecorder): Promise<DevelopmentGovernanceResult> {
    try {
      // 1. Record Context Generation
      await recorder.record(ExecutionLedgerEntryType.CONTEXT, { contextId: context.contextId });

      // 2. Execute Plugins (Includes Validation Pipeline internally, or split out depending on Engine design)
      const executionResult = await this.engine.execute(context);
      await recorder.record(ExecutionLedgerEntryType.PLUGIN, { 
        durationMs: executionResult.durationMs,
        executedCount: executionResult.executedPlugins.length
      });

      // 3. Extract Validation & Review results (Mocking the extraction process for Coordinator demonstration)
      // In reality, executionResult should contain or produce ValidationPipelineResult and ReviewResults.
      const mockValidationResult = { pipelineId: 'PL-1', failedStages: [], stageResults: [], actualCost: 0 } as any;
      const mockReviewResults = [] as any[];

      await recorder.record(ExecutionLedgerEntryType.VALIDATION, { pipelineId: mockValidationResult.pipelineId });
      await recorder.record(ExecutionLedgerEntryType.REVIEW, { reviewersCount: mockReviewResults.length });

      // 4. Execute Governance
      const governanceResult = this.governance.evaluate({
        validationResult: mockValidationResult,
        reviewResults: mockReviewResults,
        session: null as any // Pass actual session here
      });

      await recorder.record(ExecutionLedgerEntryType.GOVERNANCE, { 
        decisionId: governanceResult.decision.decisionId,
        status: governanceResult.decision.status
      });

      // Flush ledger for this request
      await recorder.flush();

      return governanceResult;
    } catch (error) {
      // Record error state if possible
      await recorder.record(ExecutionLedgerEntryType.SYSTEM, { error: (error as Error).message });
      await recorder.flush();
      throw error;
    }
  }
}
