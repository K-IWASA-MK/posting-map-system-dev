import { ValidationStateMachine } from '../../core/aios/validation/state/ValidationStateMachine';
import { ValidationPlanningService } from '../../core/aios/validation/services/ValidationPlanningService';
import { ValidatorSelectionService } from '../../core/aios/validation/services/ValidatorSelectionService';
import { ValidationPipelineService } from '../../core/aios/validation/services/ValidationPipelineService';
import { ValidationScoringService } from '../../core/aios/validation/services/ValidationScoringService';
import { ValidationAggregationService } from '../../core/aios/validation/services/ValidationAggregationService';
import { ValidationEvidenceService } from '../../core/aios/validation/services/ValidationEvidenceService';
import { ValidationEventBus } from '../../core/aios/validation/observability/ValidationEventBus';
import { ValidationMetrics } from '../../core/aios/validation/metrics/ValidationMetrics';
import { AuditLedger, EvidenceLedger, ScoreLedger, AggregationLedger, PipelineLedger } from '../../core/aios/validation/ledger/ValidationLedger';
import { ValidationOrchestrationRuntime } from '../../core/aios/validation/runtime/ValidationOrchestrationRuntime';
import { GraphBuilder } from '../../core/aios/validation/services/GraphBuilder';
import { GraphValidator } from '../../core/aios/validation/services/GraphValidator';
import { ExecutionOrderGenerator } from '../../core/aios/validation/services/ExecutionOrderGenerator';
import { ValidatorRegistry } from '../../core/aios/validation/registry/ValidatorRegistry';
import { MockSuccessValidator } from '../../core/aios/validation/validators/MockSuccessValidator';
import { MockWarningValidator } from '../../core/aios/validation/validators/MockWarningValidator';
import { MockTimeoutValidator } from '../../core/aios/validation/validators/MockTimeoutValidator';
import { MockFailureValidator } from '../../core/aios/validation/validators/MockFailureValidator';

async function runWalkthrough() {
  const eventBus = new ValidationEventBus();
  
  // Set up logging for events
  const logEvent = (name: string) => (payload: any) => console.log(`[EVENT] ${name}:`, JSON.stringify(payload, null, 2));
  
  const events = [
    'ValidationPlanCreated', 'ValidatorInitialized', 'ValidationStarted', 
    'ValidationCompleted', 'EvidenceCollected', 'ScoreCalculated', 
    'AggregationStarted', 'AggregationCompleted', 'VerificationCompleted',
    'ValidationFailed', 'ValidationArchived'
  ];
  events.forEach(e => eventBus.subscribe(e, logEvent(e)));

  const registry = new ValidatorRegistry();
  registry.register(new MockSuccessValidator());
  registry.register(new MockWarningValidator());
  registry.register(new MockTimeoutValidator());
  // We can also register MockFailureValidator but let's do a successful walkthrough first.

  const runtime = new ValidationOrchestrationRuntime(
    new ValidationStateMachine(),
    new ValidationPlanningService(new GraphBuilder(), new GraphValidator(), new ExecutionOrderGenerator()),
    new ValidatorSelectionService(registry),
    new ValidationPipelineService(),
    new ValidationScoringService({} as any),
    new ValidationAggregationService(),
    new ValidationEvidenceService(),
    eventBus,
    new ValidationMetrics(),
    new AuditLedger(),
    new EvidenceLedger(),
    new ScoreLedger(),
    new AggregationLedger(),
    new PipelineLedger()
  );

  console.log("=== STARTING VALIDATION WALKTHROUGH ===");
  const targetPayload = { executionId: 'exec-123', governanceId: 'gov-456' };
  const requiredValidators = ['mock-success-validator', 'mock-warning-validator', 'mock-timeout-validator'];
  const dependencies = [
    { from: 'mock-success-validator', to: 'mock-warning-validator' },
    { from: 'mock-warning-validator', to: 'mock-timeout-validator' }
  ];

  try {
    const result = await runtime.runValidation(targetPayload, requiredValidators, dependencies);
    console.log("=== FINAL RESULT ===");
    console.log(`Final State: ${result.finalState}`);
    console.log(`Aggregated Score: ${result.aggregationResult.aggregatedScore}`);
    console.log(`Aggregated Severity: ${result.aggregationResult.aggregatedSeverity}`);
  } catch (err) {
    console.error("Walkthrough failed", err);
  }
}

runWalkthrough();
