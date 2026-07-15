import { SelfEvolutionRuntime } from '../../core/evolution/runtime/SelfEvolutionRuntime';
import { EvolutionStateMachine } from '../../core/evolution/state/EvolutionStateMachine';
import { EvolutionEventBus } from '../../core/evolution/observability/EvolutionEventBus';
import { EvolutionMetrics } from '../../core/evolution/metrics/EvolutionMetrics';
import { EvolutionPlanningService, StrategySelectionService } from '../../core/evolution/services/EvolutionPlanningService';
import { EvolutionSimulationService, ImpactEstimator, RiskEstimator, BenefitEstimator, CompatibilityEstimator, SimulationReporter } from '../../core/evolution/services/EvolutionSimulationService';
import { EvolutionApprovalService } from '../../core/evolution/services/EvolutionApprovalService';
import { EvolutionCandidate } from '../../core/evolution/models/EvolutionCandidate';
import { EvolutionTarget, EvolutionStrategy } from '../../core/evolution/models/EvolutionEnums';
import { EvolutionLedger, SimulationLedger, ApprovalLedger, StrategyLedger, HistoryLedger, AuditLedger, CandidateLedger, PlanLedger } from '../../core/evolution/ledger/EvolutionLedger';

function createRuntime(): SelfEvolutionRuntime {
  const eventBus = new EvolutionEventBus();
  
  const eventsToLog = [
    'StateTransitioned:ANALYZING', 'StateTransitioned:PLANNING', 'StateTransitioned:SIMULATING', 
    'StateTransitioned:READY', 'StateTransitioned:APPROVAL', 'StateTransitioned:APPROVED', 
    'StateTransitioned:EVOLVING', 'StateTransitioned:EVOLVED', 'StateTransitioned:REJECTED', 
    'StateTransitioned:ARCHIVED', 'EvolutionCandidateCreated', 'SimulationStarted', 
    'SimulationCompleted', 'ApprovalRequested', 'ApprovalCompleted', 'EvolutionStarted',
    'EvolutionApplied', 'EvolutionRejected', 'EvolutionArchived'
  ];
  eventsToLog.forEach(e => eventBus.subscribe(e, (payload: any) => console.log(`[EVENT] ${e}:`, payload ? JSON.stringify(payload) : '')));

  const metrics = new EvolutionMetrics();
  
  const ledgers = {
    evolution: new EvolutionLedger(),
    simulation: new SimulationLedger(),
    approval: new ApprovalLedger(),
    strategy: new StrategyLedger(),
    history: new HistoryLedger(),
    audit: new AuditLedger(),
    candidate: new CandidateLedger(),
    plan: new PlanLedger()
  };

  const simulationService = new EvolutionSimulationService(
    new ImpactEstimator(), new RiskEstimator(), new BenefitEstimator(), 
    new CompatibilityEstimator(), new SimulationReporter()
  );

  const approvalService = new EvolutionApprovalService({
    requireManualReviewBelowScore: 70,
    rejectBelowScore: 50
  });

  return new SelfEvolutionRuntime(
    new EvolutionStateMachine(),
    new StrategySelectionService(),
    new EvolutionPlanningService(),
    simulationService,
    approvalService,
    eventBus,
    metrics,
    ledgers
  );
}

function createBaseCandidate(id: string): EvolutionCandidate {
  return {
    candidateId: id,
    candidateVersion: '1.0.0',
    knowledgeId: 'kb-1',
    promotionId: 'promo-1',
    targetComponent: 'AGENTS.md',
    target: EvolutionTarget.GOVERNANCE_POLICY,
    strategy: EvolutionStrategy.INCREMENTAL_PATCH,
    expectedBenefit: 'Faster processing',
    estimatedRisk: 'LOW',
    expectedQualityDelta: 5.0,
    expectedPerformanceDelta: 10.0,
    expectedRiskReduction: 0.0,
    confidence: 0.9,
    simulationScore: 90,
    approvalScore: 90,
    policyVersion: '1.0',
    approvalPolicyVersion: '1.0',
    sourceKnowledgeVersion: 'v2.1',
    sourceLineageId: 'lineage-1',
    traceId: 'trace-evo-1',
    createdAt: new Date()
  };
}

async function runScenarios() {
  console.log("=== SCENARIO 1: Full Success ===");
  const runtime1 = createRuntime();
  const c1 = createBaseCandidate('cand-success');
  const res1 = await runtime1.evolve(c1);
  console.log(`Result 1: ${res1.finalState}\n`);

  console.log("=== SCENARIO 2: Simulation Failed ===");
  const runtime2 = createRuntime();
  const c2 = createBaseCandidate('cand-sim-fail');
  c2.estimatedRisk = 'HIGH_SIMULATION_FAIL_MOCK'; // Triggers mock fail
  const res2 = await runtime2.evolve(c2);
  console.log(`Result 2: ${res2.finalState}\n`);

  console.log("=== SCENARIO 3: Approval Rejected ===");
  const runtime3 = createRuntime();
  const c3 = createBaseCandidate('cand-app-fail');
  c3.approvalScore = 30; // Triggers approval fail (below 50)
  const res3 = await runtime3.evolve(c3);
  console.log(`Result 3: ${res3.finalState}\n`);
}

runScenarios().catch(console.error);
