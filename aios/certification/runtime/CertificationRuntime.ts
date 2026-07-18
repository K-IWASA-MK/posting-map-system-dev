import * as path from "path";
import { RuntimeEventBus } from "../../orchestration/events/RuntimeEventBus";
import { RuntimeOrchestrator } from "../../orchestration/runtime/RuntimeOrchestrator";
import {
  CertificationRequest,
  CertificationResult,
  CertificationEvent,
  toRuntimeEvent
} from "../contracts/CertificationContract";
import { RuntimeArchitectureAuditor } from "../audit/RuntimeArchitectureAuditor";
import { CertificationSelfAuditor } from "../audit/CertificationSelfAuditor";
import { DependencyGraphGenerator } from "../audit/DependencyGraphGenerator";
import { SecurityBoundaryAuditor } from "../security/SecurityBoundaryAuditor";
import { AutonomousSafetyAuditor } from "../security/AutonomousSafetyAuditor";
import { EventLineageAuditor } from "../events/EventLineageAuditor";
import { ReleaseCandidateGenerator } from "../release/ReleaseCandidateGenerator";
import { CertificationReportGenerator } from "../release/CertificationReportGenerator";
import { GenerationFreezeController } from "../freeze/GenerationFreezeController";
import { RuntimeEvent } from "../../orchestration/contracts/RuntimeEventContract";

export class CertificationRuntime {
  private readonly eventBus: RuntimeEventBus;
  private readonly orchestrator: RuntimeOrchestrator;
  private readonly archAuditor: RuntimeArchitectureAuditor;
  private readonly selfAuditor: CertificationSelfAuditor;
  private readonly graphGen: DependencyGraphGenerator;
  private readonly securityAuditor: SecurityBoundaryAuditor;
  private readonly safetyAuditor: AutonomousSafetyAuditor;
  private readonly lineageAuditor: EventLineageAuditor;
  private readonly rcGenerator: ReleaseCandidateGenerator;
  private readonly reportGenerator: CertificationReportGenerator;
  private readonly freezeController: GenerationFreezeController;

  constructor(
    eventBus: RuntimeEventBus,
    orchestrator: RuntimeOrchestrator,
    baseDir?: string,
    statePath?: string
  ) {
    this.eventBus = eventBus;
    this.orchestrator = orchestrator;
    this.archAuditor = new RuntimeArchitectureAuditor(baseDir);
    this.selfAuditor = new CertificationSelfAuditor(baseDir ? path.join(baseDir, "certification") : undefined);
    this.graphGen = new DependencyGraphGenerator(baseDir);
    this.securityAuditor = new SecurityBoundaryAuditor(baseDir);
    this.safetyAuditor = new AutonomousSafetyAuditor(
      baseDir ? path.join(baseDir, "autonomous/runtime/AutonomousExecutionController.ts") : undefined
    );
    this.lineageAuditor = new EventLineageAuditor();
    this.rcGenerator = new ReleaseCandidateGenerator();
    this.reportGenerator = new CertificationReportGenerator();
    this.freezeController = new GenerationFreezeController(statePath);
  }

  /**
   * Safe event emission matching the AIOS integration event contract.
   */
  private async emit(
    eventType: "CERTIFICATION_STARTED" | "CERTIFICATION_PASSED" | "CERTIFICATION_FAILED" | "GENERATION_FROZEN",
    correlationId: string,
    payload: Record<string, any>
  ): Promise<void> {
    const event: CertificationEvent = {
      eventId: `EV-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      eventType,
      sourceRuntime: "CertificationRuntime",
      timestamp: Date.now(),
      payload,
      schemaVersion: "v1",
      correlationId
    };

    const runtimeEvent = toRuntimeEvent(event);
    await this.eventBus.publish(runtimeEvent);
  }

  /**
   * Safe execution entry point for Generation certification and freezing.
   */
  public async executeCertification(
    request: CertificationRequest,
    options: {
      reportPath: string;
      graphPath: string;
      eventsToVerify: readonly RuntimeEvent[];
      totalTests?: number;
    }
  ): Promise<CertificationResult> {
    const correlationId = request.certificationId;

    // 1. Emit START event
    await this.emit("CERTIFICATION_STARTED", correlationId, {
      certificationId: request.certificationId,
      targetVersion: request.targetVersion
    });

    const findings: string[] = [];
    let overallScore = 100;
    let failed = false;

    // 2. Perform Certification Self Audit
    const selfAudit = this.selfAuditor.audit();
    if (!selfAudit.success) {
      findings.push(...selfAudit.findings);
      overallScore = Math.min(overallScore, selfAudit.score);
      failed = true;
    }

    // 3. Perform Runtime Architecture Audit
    const archAudit = this.archAuditor.audit();
    if (!archAudit.success) {
      findings.push(...archAudit.findings);
      overallScore = Math.min(overallScore, archAudit.score);
      failed = true;
    }

    // 4. Generate Dependency Graph
    const graphResult = this.graphGen.generate(options.graphPath);
    if (!graphResult.success) {
      findings.push(graphResult.error || "Dependency Graph Cycle Detected.");
      overallScore = Math.min(overallScore, 50);
      failed = true;
    }

    // 5. Security Boundary Audit
    const secAudit = this.securityAuditor.audit();
    if (!secAudit.success) {
      findings.push(...secAudit.findings);
      overallScore = Math.min(overallScore, secAudit.score);
      failed = true;
    }

    // 6. Autonomous Safety Audit
    const safetyAudit = this.safetyAuditor.audit();
    if (!safetyAudit.success) {
      findings.push(...safetyAudit.findings);
      overallScore = Math.min(overallScore, safetyAudit.score);
      failed = true;
    }

    // 7. Event Lineage Audit
    const lineageResult = this.lineageAuditor.audit(options.eventsToVerify);
    if (!lineageResult.success) {
      findings.push(...lineageResult.findings);
      overallScore = Math.min(overallScore, lineageResult.score);
      failed = true;
    }

    if (failed || overallScore < 80) {
      const result: CertificationResult = {
        status: "FAILED",
        score: overallScore,
        findings,
        generatedAt: Date.now()
      };
      await this.emit("CERTIFICATION_FAILED", correlationId, { score: overallScore, findings });
      return result;
    }

    // 8. Generate preliminary Report (without certificationHash)
    let tempResult: CertificationResult = {
      status: "CERTIFIED",
      score: overallScore,
      findings,
      generatedAt: Date.now()
    };
    this.reportGenerator.generate(tempResult, { totalTests: options.totalTests }, options.reportPath);

    // 9. Generate RC & Pin Hash
    const rcResult = this.rcGenerator.generateRC(request.targetVersion, options.reportPath, options.graphPath, {
      testsPassed: true,
      securityPassed: true
    });

    const certifiedResult: CertificationResult = {
      status: "CERTIFIED",
      score: overallScore,
      findings,
      generatedAt: tempResult.generatedAt,
      certificationHash: rcResult.certificationHash
    };

    // Re-generate report to include final certificationHash
    this.reportGenerator.generate(certifiedResult, { totalTests: options.totalTests }, options.reportPath);

    await this.emit("CERTIFICATION_PASSED", correlationId, {
      version: request.targetVersion,
      certificationHash: rcResult.certificationHash
    });

    // 10. Perform Generation Freeze
    this.freezeController.freeze(request.targetGeneration);
    await this.emit("GENERATION_FROZEN", correlationId, {
      generation: request.targetGeneration,
      freezeState: this.freezeController.getState()
    });

    return certifiedResult;
  }

  public getFreezeController(): GenerationFreezeController {
    return this.freezeController;
  }

  public getSelfAuditor(): CertificationSelfAuditor {
    return this.selfAuditor;
  }
}
