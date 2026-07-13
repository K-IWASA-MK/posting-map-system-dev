import { KnowledgePromotionRuntime } from '../../core/aios/promotion/runtime/KnowledgePromotionRuntime';
import { PromotionStateMachine } from '../../core/aios/promotion/state/PromotionStateMachine';
import { CandidateAssessmentService } from '../../core/aios/promotion/services/CandidateAssessmentService';
import { KnowledgeMergeEngine } from '../../core/aios/promotion/services/KnowledgeMergeEngine';
import { MergePlanner } from '../../core/aios/promotion/services/MergePlanner';
import { ConflictDetector } from '../../core/aios/promotion/services/ConflictDetector';
import { MergeSimulator } from '../../core/aios/promotion/services/MergeSimulator';
import { VersionGenerator } from '../../core/aios/promotion/services/VersionGenerator';
import { LineageUpdater } from '../../core/aios/promotion/services/LineageUpdater';
import { PromotionWriter } from '../../core/aios/promotion/services/PromotionWriter';
import { PromotionEventBus } from '../../core/aios/promotion/observability/PromotionEventBus';
import { PromotionMetrics } from '../../core/aios/promotion/metrics/PromotionMetrics';
import { PromotionLedger, MergeLedger, ConflictLedger, VersionLedger, LineageLedger, AuditLedger, CandidateLedger, KnowledgeLedger } from '../../core/aios/promotion/ledger/PromotionLedger';
import { PromotionCandidate } from '../../core/aios/promotion/models/PromotionCandidate';

function createRuntime(): KnowledgePromotionRuntime {
  const eventBus = new PromotionEventBus();
  
  const events = [
    'StateTransitioned:ASSESSING', 'StateTransitioned:QUALITY_CHECK', 'StateTransitioned:CONFLICT_ANALYSIS', 
    'StateTransitioned:READY', 'StateTransitioned:VERSIONING', 'StateTransitioned:PROMOTING', 
    'StateTransitioned:PROMOTED', 'StateTransitioned:REJECTED', 'StateTransitioned:ARCHIVED',
    'PromotionCandidateCreated', 'PromotionAssessmentStarted', 'QualityChecked', 
    'ConflictDetected', 'PromotionApproved', 'PromotionRejected', 'PromotionArchived'
  ];
  events.forEach(e => eventBus.subscribe(e, (payload: any) => console.log(`[EVENT] ${e}:`, payload ? JSON.stringify(payload) : '')));

  const policy = { minQualityScore: 80, minConfidence: 0.8, requiredCapabilities: [], autoRejectOnConflict: true };
  const conflictPolicy = { strictSemanticCheck: false, failOnDuplicate: true, ignoredConflictTypes: [] };

  return new KnowledgePromotionRuntime(
    new PromotionStateMachine(),
    new CandidateAssessmentService(policy),
    new KnowledgeMergeEngine(
      new MergePlanner(),
      new ConflictDetector(conflictPolicy),
      new MergeSimulator(),
      new VersionGenerator(),
      new LineageUpdater(),
      new PromotionWriter()
    ),
    eventBus,
    new PromotionMetrics(),
    {
      promotion: new PromotionLedger(),
      merge: new MergeLedger(),
      conflict: new ConflictLedger(),
      version: new VersionLedger(),
      lineage: new LineageLedger(),
      audit: new AuditLedger(),
      candidate: new CandidateLedger(),
      knowledge: new KnowledgeLedger()
    }
  );
}

function createBaseCandidate(id: string): PromotionCandidate {
  return {
    candidateId: id,
    candidateVersion: '1.0',
    proposalId: 'prop-1',
    executionId: 'exec-1',
    validationId: 'val-1',
    governanceId: 'gov-1',
    sourceRuntime: 'ValidationOrchestrationRuntime',
    targetKnowledge: 'kb-target',
    knowledgeDomain: 'core-domain',
    knowledgeCategory: 'architecture',
    knowledgePriority: 'HIGH',
    expectedKnowledgeType: 'PATTERN',
    knowledgeTags: ['core'],
    score: 95,
    qualityScore: 95,
    severity: 'PASS',
    confidence: 0.95,
    promotionConfidence: 0.95,
    evidence: { msg: 'verified' },
    artifacts: ['file1.ts'],
    promotionReason: 'improve performance',
    learningSource: 'LearningRuntime',
    knowledgeFingerprint: 'fingerprint-hash',
    sourceCommit: 'commit-hash',
    sourceLedgerId: 'ledger-1',
    promotionSessionId: 'sess-1',
    promotionPolicyVersion: '1.0',
    knowledgeVersion: '1.0',
    lineage: ['genesis'],
    traceId: 'trace-1',
    createdAt: new Date()
  };
}

async function runScenarios() {
  console.log("=== SCENARIO 1: Promotion Success ===");
  const runtime1 = createRuntime();
  const c1 = createBaseCandidate('cand-success');
  const res1 = await runtime1.promote(c1);
  console.log(`Result 1: ${res1.finalState}\n`);

  console.log("=== SCENARIO 2: Promotion Rejected (Low Quality) ===");
  const runtime2 = createRuntime();
  const c2 = createBaseCandidate('cand-rejected');
  c2.qualityScore = 50; // below 80
  const res2 = await runtime2.promote(c2);
  console.log(`Result 2: ${res2.finalState}\n`);

  console.log("=== SCENARIO 3: Duplicate Knowledge (Conflict) ===");
  const runtime3 = createRuntime();
  const c3 = createBaseCandidate('cand-duplicate');
  c3.knowledgeDomain = 'duplicate-domain'; // triggers conflict in MockConflictDetector
  const res3 = await runtime3.promote(c3);
  console.log(`Result 3: ${res3.finalState}\n`);
}

runScenarios().catch(console.error);
