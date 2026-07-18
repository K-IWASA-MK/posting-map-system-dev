import * as fs from "fs";
import * as path from "path";
import { RuntimeRegistry } from "../../../aios/orchestration/registry/RuntimeRegistry";
import { RuntimeEventBus } from "../../../aios/orchestration/events/RuntimeEventBus";
import { RuntimeOrchestrator } from "../../../aios/orchestration/runtime/RuntimeOrchestrator";
import { RuntimeIntegrationTrace } from "../../../aios/orchestration/runtime/RuntimeIntegrationTrace";
import { CertificationRuntime } from "../../../aios/certification/runtime/CertificationRuntime";
import { CertificationRequest } from "../../../aios/certification/contracts/CertificationContract";
import { RuntimeEvent } from "../../../aios/orchestration/contracts/RuntimeEventContract";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Temporary file configuration
const TEMP_DIR = path.join(__dirname, "temp-cert");
const GRAPH_PATH = path.join(TEMP_DIR, "aios-dependency-graph.json");
const REPORT_PATH = path.join(TEMP_DIR, "AIOS_GENERATION_5_CERTIFICATION.md");
const FREEZE_STATE_PATH = path.join(TEMP_DIR, "freeze-state.json");

function cleanDirs() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function runTest() {
  console.log("🧪 Running AIOS Generation 5 Stabilization & Certification Tests...\n");
  cleanDirs();

  const registry = new RuntimeRegistry();
  const eventBus = new RuntimeEventBus();
  const traceLogger = new RuntimeIntegrationTrace();
  const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

  const baseDir = path.join(__dirname, "../../../aios");

  const request: CertificationRequest = {
    certificationId: "CERT-GEN5-001",
    targetVersion: "5.0.0-alpha",
    targetGeneration: "5",
    auditScope: ["ARCHITECTURE", "SECURITY", "LINEAGE", "FREEZE"],
    timestamp: Date.now()
  };

  const dummyLineageEvents: RuntimeEvent[] = [
    {
      eventId: "EV-INIT-PROP-1",
      eventType: "EXECUTION_COMPLETED",
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: { status: "COMPLETED" },
      schemaVersion: "v1",
      correlationId: "CORR-001"
    },
    {
      eventId: "EV-VAL-1",
      eventType: "VALIDATION_COMPLETED",
      sourceRuntime: "ValidationRuntime",
      timestamp: Date.now(),
      payload: { status: "VALID" },
      schemaVersion: "v1",
      correlationId: "CORR-001"
    },
    {
      eventId: "EV-AUD-1",
      eventType: "AUDIT_RECORDED",
      sourceRuntime: "AuditRuntime",
      timestamp: Date.now(),
      payload: { status: "SUCCESS" },
      schemaVersion: "v1",
      correlationId: "CORR-001"
    },
    {
      eventId: "EV-CMP-1",
      eventType: "COMPLETION_COMPLETED",
      sourceRuntime: "CompletionRuntime",
      timestamp: Date.now(),
      payload: { status: "SUCCESS" },
      schemaVersion: "v1",
      correlationId: "CORR-001"
    }
  ];

  // ==========================================
  // Scenario 1: Normal Execution & Success
  // ==========================================
  {
    console.log("Scenario 1: Normal Certification Flow...");
    const runtime = new CertificationRuntime(eventBus, orchestrator, baseDir, FREEZE_STATE_PATH);
    const result = await runtime.executeCertification(request, {
      reportPath: REPORT_PATH,
      graphPath: GRAPH_PATH,
      eventsToVerify: dummyLineageEvents,
      totalTests: 150
    });

    console.log("DEBUG Certification Result:", result);
    assert(result.status === "CERTIFIED", "Should successfully certify the baseline.");
    assert(result.score >= 80, "Certification score should be passing.");
    assert(result.certificationHash !== undefined, "Result should include certificationHash.");
    assert(fs.existsSync(REPORT_PATH), "Should write report file.");
    assert(fs.existsSync(GRAPH_PATH), "Should write dependency graph.");
    assert(fs.existsSync(FREEZE_STATE_PATH), "Should write freeze-state.json.");
    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Certification Self Audit
  // ==========================================
  {
    console.log("Scenario 2: Certification Self Audit...");
    const runtime = new CertificationRuntime(eventBus, orchestrator, baseDir, FREEZE_STATE_PATH);
    const selfAudit = runtime.getSelfAuditor().audit();
    assert(selfAudit.success === true, "Self audit should pass on clean codebase.");
    assert(selfAudit.score === 100, "Clean code score should be 100.");
    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Certification Hash Tamper Check
  // ==========================================
  {
    console.log("Scenario 3: Certification Hash Pinning & Tampering Check...");
    // Read the generated report and modify it slightly
    const reportText = fs.readFileSync(REPORT_PATH, "utf-8");
    fs.writeFileSync(REPORT_PATH, reportText + "\n[Tampered Content]\n", "utf-8");

    // Perform validation check by calculating hash again
    const runtime = new CertificationRuntime(eventBus, orchestrator, baseDir, FREEZE_STATE_PATH);
    const rcResult = runtime["rcGenerator"].generateRC("5.0.0-alpha", REPORT_PATH, GRAPH_PATH);

    // Verify metadata hash doesn't match a clean hash
    // We restore report content to clean state
    fs.writeFileSync(REPORT_PATH, reportText, "utf-8");
    const rcResultClean = runtime["rcGenerator"].generateRC("5.0.0-alpha", REPORT_PATH, GRAPH_PATH);

    assert(
      rcResult.certificationHash !== rcResultClean.certificationHash,
      "Tampered report content should result in different hash signatures."
    );
    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Freeze Protection & Persistence
  // ==========================================
  {
    console.log("Scenario 4: Freeze Protection & Persistence...");
    const runtime = new CertificationRuntime(eventBus, orchestrator, baseDir, FREEZE_STATE_PATH);
    const freezeController = runtime.getFreezeController();

    // Verify state loaded successfully from existing state file
    assert(freezeController.getState() !== null, "State should be loaded from disk.");
    assert(freezeController.getState()!.status === "FROZEN", "Should retain FROZEN status.");

    // Test modification block policies
    const featureBlock = freezeController.validateModification("aios/release/runtime/ReleaseRuntime.ts", "FEATURE");
    assert(featureBlock.allowed === false, "FEATURE additions to frozen folders should be blocked.");
    assert(featureBlock.reason!.includes("Freeze Block"), "Reason should specify freeze block.");

    const bugfixAllow = freezeController.validateModification("aios/release/runtime/ReleaseRuntime.ts", "BUGFIX");
    assert(bugfixAllow.allowed === true, "BUGFIX corrections to frozen folders should be allowed.");

    const patchAllow = freezeController.validateModification("aios/release/runtime/ReleaseRuntime.ts", "SECURITY_PATCH");
    assert(patchAllow.allowed === true, "SECURITY_PATCH additions should be allowed.");

    // Test clean restore simulated restart
    freezeController.unfreeze();
    assert(fs.existsSync(FREEZE_STATE_PATH) === false, "Unfreeze should delete state file.");
    console.log("✅ Scenario 4 Passed.\n");
  }

  // Cleanup temp files
  cleanDirs();
  console.log("🎉 All Certification & Stabilization scenarios completed successfully!");
}

runTest().catch(err => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
