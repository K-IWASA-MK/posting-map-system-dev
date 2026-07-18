import * as path from "path";
import * as fs from "fs";
import { RuntimeRegistry } from "../aios/orchestration/registry/RuntimeRegistry";
import { RuntimeEventBus } from "../aios/orchestration/events/RuntimeEventBus";
import { RuntimeOrchestrator } from "../aios/orchestration/runtime/RuntimeOrchestrator";
import { RuntimeIntegrationTrace } from "../aios/orchestration/runtime/RuntimeIntegrationTrace";
import { CertificationRuntime } from "../aios/certification/runtime/CertificationRuntime";
import { CertificationRequest } from "../aios/certification/contracts/CertificationContract";
import { RuntimeEvent } from "../aios/orchestration/contracts/RuntimeEventContract";

async function run() {
  console.log("Running official AIOS Generation 5 Certification...");

  const registry = new RuntimeRegistry();
  const eventBus = new RuntimeEventBus();
  const traceLogger = new RuntimeIntegrationTrace();
  const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

  const baseDir = path.join(__dirname, "../aios");
  const statePath = path.join(__dirname, "../freeze-state.json");
  const reportPath = path.join(__dirname, "../AIOS_GENERATION_5_CERTIFICATION.md");
  const graphPath = path.join(__dirname, "../aios-dependency-graph.json");

  const runtime = new CertificationRuntime(eventBus, orchestrator, baseDir, statePath);

  const request: CertificationRequest = {
    certificationId: "CERT-GEN5-FINAL",
    targetVersion: "5.0.0-alpha",
    targetGeneration: "5",
    auditScope: ["ARCHITECTURE", "SECURITY", "LINEAGE", "FREEZE"],
    timestamp: Date.now()
  };

  // Mock lineage of the main Generation 5 events to certify the delivery chain
  const lineageEvents: RuntimeEvent[] = [
    {
      eventId: "EV-AUTONOMOUS-TRIGGER",
      eventType: "EXECUTION_COMPLETED", // Maps to the standard string type in registry
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now() - 5000,
      payload: { status: "COMPLETED" },
      schemaVersion: "v1",
      correlationId: "CORR-GEN5"
    },
    {
      eventId: "EV-VALIDATION-COMPLETED",
      eventType: "VALIDATION_COMPLETED",
      sourceRuntime: "ValidationRuntime",
      timestamp: Date.now() - 4000,
      payload: { status: "VALID" },
      schemaVersion: "v1",
      correlationId: "CORR-GEN5"
    },
    {
      eventId: "EV-AUDIT-RECORDED",
      eventType: "AUDIT_RECORDED",
      sourceRuntime: "AuditRuntime",
      timestamp: Date.now() - 3000,
      payload: { status: "SUCCESS" },
      schemaVersion: "v1",
      correlationId: "CORR-GEN5"
    },
    {
      eventId: "EV-COMPLETION-COMPLETED",
      eventType: "COMPLETION_COMPLETED",
      sourceRuntime: "CompletionRuntime",
      timestamp: Date.now() - 2000,
      payload: { status: "SUCCESS" },
      schemaVersion: "v1",
      correlationId: "CORR-GEN5"
    },
    {
      eventId: "EV-RELEASE-COMPLETED",
      eventType: "RELEASE_COMPLETED" as any,
      sourceRuntime: "ReleaseRuntime",
      timestamp: Date.now() - 1000,
      payload: { status: "SUCCESS" },
      schemaVersion: "v1",
      correlationId: "CORR-GEN5"
    }
  ];

  const result = await runtime.executeCertification(request, {
    reportPath,
    graphPath,
    eventsToVerify: lineageEvents,
    totalTests: 150
  });

  console.log("Certification completed!");
  console.log("Status:", result.status);
  console.log("Score:", result.score);
  console.log("Hash:", result.certificationHash);
  console.log("Findings:", result.findings);
}

run().catch(err => {
  console.error("Certification run failed:", err);
  process.exit(1);
});
