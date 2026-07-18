import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ReleaseRuntime } from "../../../aios/release/runtime/ReleaseRuntime";
import { ReleaseEvent } from "../../../aios/release/contracts/ReleaseContract";
import { GitHubPagesDeploymentAdapter } from "../../../aios/release/adapters/GitHubPagesDeploymentAdapter";
import { GASDeploymentAdapter } from "../../../aios/release/adapters/GASDeploymentAdapter";
import { GoogleDriveDeploymentAdapter } from "../../../aios/release/adapters/GoogleDriveDeploymentAdapter";
import { DeploymentAdapter } from "../../../aios/release/adapters/DeploymentAdapter";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Config test directories
const TEST_WORKSPACE = path.join(__dirname, "temp-release-workspace");
const DEPLOY_TARGET_DIR = path.join(__dirname, "temp-release-deploy");

function cleanDirs() {
  if (fs.existsSync(TEST_WORKSPACE)) {
    fs.rmSync(TEST_WORKSPACE, { recursive: true, force: true });
  }
  if (fs.existsSync(DEPLOY_TARGET_DIR)) {
    fs.rmSync(DEPLOY_TARGET_DIR, { recursive: true, force: true });
  }
}

function setupWorkspace() {
  cleanDirs();
  fs.mkdirSync(TEST_WORKSPACE, { recursive: true });
  fs.mkdirSync(DEPLOY_TARGET_DIR, { recursive: true });
}

async function runTest() {
  console.log("🧪 Running Production Cloud Deployment & Release Foundation Test...\n");

  // ==========================================
  // Scenario 1: Normal Release Lifecycle
  // ==========================================
  {
    setupWorkspace();

    const runtime = new ReleaseRuntime(TEST_WORKSPACE);
    const events: ReleaseEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    // Register all standard adapters
    runtime.registerAdapter(new GitHubPagesDeploymentAdapter(DEPLOY_TARGET_DIR));
    runtime.registerAdapter(new GASDeploymentAdapter(DEPLOY_TARGET_DIR));
    runtime.registerAdapter(new GoogleDriveDeploymentAdapter(DEPLOY_TARGET_DIR));

    // Write mock artifact
    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    const contentObj = { district: "MIE-05", statistics: { turnout: 58.4 } };
    const contentStr = JSON.stringify(contentObj);
    fs.writeFileSync(artifactPath, contentStr, "utf-8");

    const expectedHash = crypto.createHash("sha256").update(contentStr).digest("hex");

    const request = {
      releaseId: "REL-TEST-001",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [
        { filePath: artifactPath, expectedHash }
      ],
      schemaVersion: "v1" as const
    };

    const result = await runtime.processRelease(request);

    assert(result.status === "SUCCESS", "Release must succeed.");
    assert(result.verified === true, "Verification must pass.");
    assert(result.deployedTargets.length === 3, "Should deploy to 3 targets.");
    assert(result.deployedTargets.every(t => t.success === true), "All targets must succeed.");

    // Event checking
    assert(events.length === 2, "Expected exactly 2 events (requested and completed).");
    assert(events[0].type === "RELEASE_REQUESTED", "First event must be RELEASE_REQUESTED.");
    assert(events[1].type === "RELEASE_COMPLETED", "Second event must be RELEASE_COMPLETED.");
    assert(events[1].version === "1.0.0", "Event version matches.");

    // Target files exist & match contents
    const ghPagesFile = path.join(DEPLOY_TARGET_DIR, "gh-pages", "dashboard-data.json");
    const gasFile = path.join(DEPLOY_TARGET_DIR, "gas-deploy", "dashboard-data.json");
    const gdriveFile = path.join(DEPLOY_TARGET_DIR, "gdrive-deploy", "dashboard-data.json");

    assert(fs.existsSync(ghPagesFile), "GitHub Pages target file must exist.");
    assert(fs.existsSync(gasFile), "GAS target file must exist.");
    assert(fs.existsSync(gdriveFile), "Google Drive target file must exist.");

    assert(fs.readFileSync(ghPagesFile, "utf-8") === contentStr, "GitHub Pages file content must match source.");

    console.log("   ✓ Normal Release Lifecycle verified.");
  }

  // ==========================================
  // Scenario 2: SemVer Validation Violation
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);
    const events: ReleaseEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    fs.writeFileSync(artifactPath, "content", "utf-8");

    const invalidVersions = ["v1.0.0", "1.0", "1.a.2", "1.0.0-beta"];

    for (const ver of invalidVersions) {
      const request = {
        releaseId: `REL-VER-ERR-${ver}`,
        sprintId: "SPRINT-REL-01",
        version: ver,
        targetEnvironment: "production" as const,
        artifacts: [{ filePath: artifactPath }],
        schemaVersion: "v1" as const
      };

      const result = await runtime.processRelease(request);
      assert(result.status === "BLOCKED", `Version "${ver}" must be BLOCKED.`);
      assert(events.some(ev => ev.type === "RELEASE_BLOCKED" && ev.version === ver), "RELEASE_BLOCKED event must be emitted.");
    }

    console.log("   ✓ SemVer Validation (Strict major.minor.patch) verified.");
  }

  // ==========================================
  // Scenario 3: Replay Safety (Version Lock)
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);
    runtime.registerAdapter(new GitHubPagesDeploymentAdapter(DEPLOY_TARGET_DIR));

    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    fs.writeFileSync(artifactPath, "content", "utf-8");

    const request = {
      releaseId: "REL-REPLAY-01",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [{ filePath: artifactPath }],
      schemaVersion: "v1" as const
    };

    const firstResult = await runtime.processRelease(request);
    assert(firstResult.status === "SUCCESS", "First release must succeed.");

    // Run again with same version
    const secondEvents: ReleaseEvent[] = [];
    runtime.subscribe(ev => secondEvents.push(ev));

    const secondResult = await runtime.processRelease({
      ...request,
      releaseId: "REL-REPLAY-02"
    });

    assert(secondResult.status === "BLOCKED", "Repeated release must be BLOCKED.");
    assert(secondResult.error!.includes("Replay Safety"), "Error must state Replay Safety.");
    assert(secondEvents.some(ev => ev.type === "RELEASE_BLOCKED"), "Event RELEASE_BLOCKED must be emitted.");

    console.log("   ✓ Replay Safety (Version Lock) verified.");
  }

  // ==========================================
  // Scenario 4: Artifact Integrity Failure
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);
    runtime.registerAdapter(new GitHubPagesDeploymentAdapter(DEPLOY_TARGET_DIR));

    // File missing test
    {
      const request = {
        releaseId: "REL-INTEG-ERR-1",
        sprintId: "SPRINT-REL-01",
        version: "1.0.0",
        targetEnvironment: "production" as const,
        artifacts: [{ filePath: path.join(TEST_WORKSPACE, "nonexistent.json") }],
        schemaVersion: "v1" as const
      };
      const result = await runtime.processRelease(request);
      assert(result.status === "BLOCKED", "Missing file release must be BLOCKED.");
      assert(result.error!.includes("does not exist"), "Error must mention existence.");
    }

    // Empty file test
    {
      const emptyFile = path.join(TEST_WORKSPACE, "empty.json");
      fs.writeFileSync(emptyFile, "", "utf-8");
      const request = {
        releaseId: "REL-INTEG-ERR-2",
        sprintId: "SPRINT-REL-01",
        version: "1.0.1",
        targetEnvironment: "production" as const,
        artifacts: [{ filePath: emptyFile }],
        schemaVersion: "v1" as const
      };
      const result = await runtime.processRelease(request);
      assert(result.status === "BLOCKED", "Empty file release must be BLOCKED.");
      assert(result.error!.includes("is empty"), "Error must mention file is empty.");
    }

    // Hash mismatch test
    {
      const dataFile = path.join(TEST_WORKSPACE, "data.json");
      fs.writeFileSync(dataFile, "my-data", "utf-8");
      const request = {
        releaseId: "REL-INTEG-ERR-3",
        sprintId: "SPRINT-REL-01",
        version: "1.0.2",
        targetEnvironment: "production" as const,
        artifacts: [{ filePath: dataFile, expectedHash: "wrong-hash-value" }],
        schemaVersion: "v1" as const
      };
      const result = await runtime.processRelease(request);
      assert(result.status === "BLOCKED", "Hash mismatch release must be BLOCKED.");
      assert(result.error!.includes("integrity mismatch"), "Error must mention integrity mismatch.");
    }

    console.log("   ✓ Artifact Integrity (Existence, Emptiness, Hash validation) verified.");
  }

  // ==========================================
  // Scenario 5: Adapter Failure Handling (No Rollback)
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);

    // Mock failing adapter
    const failingAdapter: DeploymentAdapter = {
      name: "FailingAdapter",
      deploy: async () => {
        return { success: false, destination: "", error: "Simulation: network unreachable" };
      }
    };
    runtime.registerAdapter(failingAdapter);

    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    fs.writeFileSync(artifactPath, "content", "utf-8");

    const events: ReleaseEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    const request = {
      releaseId: "REL-ADAPTER-ERR",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [{ filePath: artifactPath }],
      schemaVersion: "v1" as const
    };

    const result = await runtime.processRelease(request);
    assert(result.status === "FAILED", "Release must fail due to adapter failure.");
    assert(result.deployedTargets[0].success === false, "Failing adapter status is recorded.");
    assert(events.some(ev => ev.type === "RELEASE_FAILED"), "RELEASE_FAILED event must be emitted.");

    console.log("   ✓ Adapter Failure Handling verified.");
  }

  // ==========================================
  // Scenario 6: Production Verification Failure
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);

    // Register adapter that succeeds, but we will corrupt the file before verification
    const adapter = new GitHubPagesDeploymentAdapter(DEPLOY_TARGET_DIR);
    runtime.registerAdapter(adapter);

    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    fs.writeFileSync(artifactPath, "original-content", "utf-8");

    // Stub/hook verify to corrupt target file synchronously right after write (simulating disk corruption / deployment failure)
    const originalProcess = runtime.processRelease.bind(runtime);
    runtime.processRelease = async (req) => {
      const res = await originalProcess(req);
      return res;
    };

    const wrapperAdapter: DeploymentAdapter = {
      name: "CorruptingAdapter",
      deploy: async (relId, fPath, content) => {
        const depRes = await adapter.deploy(relId, fPath, content);
        // Corrupt content immediately before verification
        fs.writeFileSync(depRes.destination, "corrupted-content", "utf-8");
        return depRes;
      }
    };
    
    const corruptedRuntime = new ReleaseRuntime(TEST_WORKSPACE);
    corruptedRuntime.registerAdapter(wrapperAdapter);

    const request = {
      releaseId: "REL-VERIFY-ERR",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [{ filePath: artifactPath }],
      schemaVersion: "v1" as const
    };

    const result = await corruptedRuntime.processRelease(request);
    assert(result.status === "FAILED", "Release must fail on verification mismatch.");
    assert(result.verified === false, "Verification state must be false.");
    assert(result.error!.includes("verification failed"), "Error must state verification failed.");

    console.log("   ✓ Production Verification Failure verified.");
  }

  // ==========================================
  // Scenario 7: Path Traversal Defense
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);

    const traversalPath = path.join(TEST_WORKSPACE, "..", "outside-root.txt");

    const request = {
      releaseId: "REL-TRAVERSAL-ERR",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [{ filePath: traversalPath }],
      schemaVersion: "v1" as const
    };

    const result = await runtime.processRelease(request);
    assert(result.status === "BLOCKED", "Path traversal must be BLOCKED.");
    assert(result.error!.includes("Path traversal") || result.error!.includes("Path boundary"), "Error mentions traversal or boundary.");

    console.log("   ✓ Path Traversal Defense verified.");
  }

  // ==========================================
  // Scenario 8: Multi Adapter Partial Failure Test
  // ==========================================
  {
    setupWorkspace();
    const runtime = new ReleaseRuntime(TEST_WORKSPACE);

    // One succeeds, one fails
    runtime.registerAdapter(new GitHubPagesDeploymentAdapter(DEPLOY_TARGET_DIR));
    runtime.registerAdapter({
      name: "FailingSecondAdapter",
      deploy: async () => {
        return { success: false, destination: "", error: "GAS quota exceeded" };
      }
    });

    const artifactPath = path.join(TEST_WORKSPACE, "dashboard-data.json");
    fs.writeFileSync(artifactPath, "content", "utf-8");

    const request = {
      releaseId: "REL-PARTIAL-ERR",
      sprintId: "SPRINT-REL-01",
      version: "1.0.0",
      targetEnvironment: "production" as const,
      artifacts: [{ filePath: artifactPath }],
      schemaVersion: "v1" as const
    };

    const result = await runtime.processRelease(request);
    assert(result.status === "FAILED", "Partial deployment failure must set release status to FAILED.");
    assert(result.deployedTargets.some(t => t.success === false), "At least one target failed.");

    console.log("   ✓ Multi Adapter Partial Failure handled correctly.");
  }

  cleanDirs();
  console.log("\n==========================================");
  console.log("🎉 PRODUCTION CLOUD DEPLOYMENT & RELEASE PASSED");
  console.log("==========================================\n");
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
